$ErrorActionPreference = "Stop"
$pptx = "D:\AIDevelop\KimiCode\AICoding\TraeAICourse\Trae_AI编程课_课程介绍.pptx"
$outDir = "D:\AIDevelop\KimiCode\AICoding\TraeAICourse\preview\pptx"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$app = New-Object -ComObject PowerPoint.Application
try {
    $pres = $app.Presentations.Open($pptx, $true, $false, $false)
    foreach ($slide in $pres.Slides) {
        $n = "{0:00}" -f $slide.SlideIndex
        $slide.Export("$outDir\slide-$n.png", "PNG", 1920, 1080)
    }
    $pres.Close()
    Write-Output "exported $($pres.Slides.Count) slides"
} finally {
    $app.Quit()
}
