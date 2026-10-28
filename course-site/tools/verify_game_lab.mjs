import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
let devServer
let browser
let browserProfile

function stopTree(child) {
  if (!child?.pid) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    child.kill('SIGTERM')
  }
}

async function isPortFree(port) {
  return new Promise((resolveResult) => {
    const tester = createServer()
    tester.once('error', () => resolveResult(false))
    tester.once('listening', () => tester.close(() => resolveResult(true)))
    tester.listen(port, '127.0.0.1')
  })
}

async function choosePort(start) {
  for (let port = start; port < start + 20; port += 1) {
    if (await isPortFree(port)) return port
  }
  throw new Error('没有可用的临时验证端口')
}

async function waitForFetch(url, timeout = 20000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch {
      // 服务尚未启动，继续短暂等待。
    }
    await delay(200)
  }
  throw new Error(`等待服务超时: ${url}`)
}

async function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl)
  await new Promise((resolveOpen, reject) => {
    socket.addEventListener('open', resolveOpen, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let nextId = 1
  const pending = new Map()
  const runtimeErrors = []
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve: resolvePending, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(JSON.stringify(message.error)))
      else resolvePending(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params)
  })
  const send = (method, params = {}) => new Promise((resolveSend, reject) => {
    const id = nextId++
    pending.set(id, { resolve: resolveSend, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
  return { socket, send, runtimeErrors }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
  console.log(`PASS ${message}`)
}

try {
  const port = await choosePort(7100)
  const debugPort = await choosePort(9330)
  const origin = `http://127.0.0.1:${port}`

  devServer = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  let serverOutput = ''
  devServer.stdout.on('data', (chunk) => { serverOutput += chunk.toString() })
  devServer.stderr.on('data', (chunk) => { serverOutput += chunk.toString() })
  devServer.on('exit', (code) => {
    if (code && code !== 0) console.error(`开发服务提前退出: ${code}\n${serverOutput}`)
  })
  await waitForFetch(`${origin}/`)

  for (const [path, label] of [['/', '首页'], ['/game-lab', '游戏实验室']]) {
    const response = await fetch(`${origin}${path}`)
    assert(response.status === 200, `${label}返回 HTTP 200`)
  }
  const zipResponse = await fetch(`${origin}/downloads/alien_invasion_ai_code.zip`)
  const zipBytes = await zipResponse.arrayBuffer()
  assert(zipResponse.status === 200 && zipBytes.byteLength > 1000, `ZIP 下载返回 HTTP 200 且非空（${zipBytes.byteLength} 字节）`)

  const cacheRoot = resolve(process.cwd(), 'node_modules', '.cache')
  mkdirSync(cacheRoot, { recursive: true })
  browserProfile = mkdtempSync(resolve(cacheRoot, 'game-lab-edge-'))
  browser = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--disable-extensions',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${browserProfile}`,
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true })

  await waitForFetch(`http://127.0.0.1:${debugPort}/json/version`)
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
  const page = targets.find((target) => target.type === 'page')
  assert(Boolean(page), '无头 Edge 页面目标可用')
  const cdp = await connectCdp(page.webSocketDebuggerUrl)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Browser.grantPermissions', {
    origin,
    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
  })

  await cdp.send('Page.navigate', { url: `${origin}/` })
  await delay(1200)
  const homeText = await evaluate(cdp, 'document.body.innerText')
  assert(homeText.includes('AI 协同游戏设计 · 外星人入侵'), '首页醒目专题入口真实渲染')

  await cdp.send('Page.navigate', { url: `${origin}/game-lab` })
  await delay(1200)
  await evaluate(cdp, `localStorage.removeItem('ai-game-lab-progress-v1'); true`)
  await cdp.send('Page.reload', { ignoreCache: true })
  await delay(1200)
  const initialText = await evaluate(cdp, 'document.body.innerText')
  assert(initialText.includes('AI 协同游戏设计') && initialText.includes('8 步关卡导航'), 'game-lab 首屏无白屏且核心内容直接可见')
  assert(initialText.includes('不会在网页里直接运行 Pygame') || initialText.includes('不会直接运行 Pygame'), '页面明确说明需在本地运行 Pygame')
  assert(await evaluate(cdp, `document.querySelectorAll('[data-slot="slider"]').length`) === 4, '参数实验室包含 4 个可交互滑块')

  await evaluate(cdp, `Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('STEP 2')).click(); true`)
  await delay(250)
  const stepTwoText = await evaluate(cdp, 'document.body.innerText')
  assert(stepTwoText.includes('steps/step02/main.py'), '点击 Stepper 可切换到第 2 步')

  const copyPoint = await evaluate(cdp, `(() => { const button = Array.from(document.querySelectorAll('button')).find((item) => item.textContent.includes('复制提示词')); button.scrollIntoView({block: 'center'}); const rect = button.getBoundingClientRect(); return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2}; })()`)
  await delay(150)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...copyPoint, button: 'left', clickCount: 1 })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...copyPoint, button: 'left', clickCount: 1 })
  await delay(800)
  const copiedText = await evaluate(cdp, 'document.body.innerText')
  assert(copiedText.includes('已复制'), '提示词复制按钮显示已复制反馈')

  await evaluate(cdp, `Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('标记本步完成')).click(); true`)
  await delay(250)
  assert(await evaluate(cdp, `JSON.parse(localStorage.getItem('ai-game-lab-progress-v1')).includes(2)`), '完成勾选写入 localStorage')
  await cdp.send('Page.reload', { ignoreCache: true })
  await delay(900)
  assert(await evaluate(cdp, `JSON.parse(localStorage.getItem('ai-game-lab-progress-v1')).includes(2)`), '刷新后完成进度仍然保留')

  await evaluate(cdp, `window.confirm = () => true; Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('重置进度')).click(); true`)
  await delay(250)
  assert(await evaluate(cdp, `JSON.parse(localStorage.getItem('ai-game-lab-progress-v1')).length === 0`), '重置进度按钮清空完成记录')
  assert(cdp.runtimeErrors.length === 0, '页面交互无未捕获 JavaScript 运行错误')

  await evaluate(cdp, 'window.scrollTo(0, 0); true')
  await delay(150)
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  const screenshotPath = resolve(process.cwd(), '..', 'preview', 'game-lab.png')
  mkdirSync(dirname(screenshotPath), { recursive: true })
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'))
  console.log(`SCREENSHOT ${screenshotPath}`)
  cdp.socket.close()
} finally {
  stopTree(browser)
  stopTree(devServer)
  await delay(500)
  if (browserProfile) rmSync(browserProfile, { recursive: true, force: true })
}
