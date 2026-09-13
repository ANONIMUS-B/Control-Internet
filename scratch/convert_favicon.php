<?php

$sourcePath = __DIR__ . '/../public/Logo-Circular.png';
$icoPath = __DIR__ . '/../public/favicon.ico';
$svgPath = __DIR__ . '/../public/favicon.svg';

if (!file_exists($sourcePath)) {
    echo "Source image not found: {$sourcePath}\n";
    exit(1);
}

$info = getimagesize($sourcePath);

// Load source PNG
$src = imagecreatefrompng($sourcePath);

// Create 32x32 icon for favicon.ico
$icoSize = 32;
$dst = imagecreatetruecolor($icoSize, $icoSize);
imagealphablending($dst, false);
imagesavealpha($dst, true);
$transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
imagefilledrectangle($dst, 0, 0, $icoSize, $icoSize, $transparent);
imagecopyresampled($dst, $src, 0, 0, 0, 0, $icoSize, $icoSize, $info[0], $info[1]);

// Capture PNG binary data
ob_start();
imagepng($dst);
$pngData = ob_get_clean();
imagedestroy($dst);
imagedestroy($src);

// Build valid binary ICO header wrapping PNG data
$pngLen = strlen($pngData);
$icoHeader = pack(
    'v3C4v2VV',
    0,         // Reserved (0)
    1,         // Type (1 = ICO)
    1,         // Number of images (1)
    32,        // Width (32)
    32,        // Height (32)
    0,         // Color palette (0)
    0,         // Reserved (0)
    1,         // Color planes (1)
    32,        // Bits per pixel (32)
    $pngLen,   // Size of image data
    22         // Offset of image data (6 header + 16 dir entry = 22)
);

file_put_contents($icoPath, $icoHeader . $pngData);
echo "favicon.ico created with binary ICO header successfully.\n";

// Create SVG wrapper with embedded base64 of Logo-Circular.png
$origPngData = base64_encode(file_get_contents($sourcePath));
$mime = $info['mime'];
$svgContent = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {$info[0]} {$info[1]}">
  <image width="{$info[0]}" height="{$info[1]}" href="data:{$mime};base64,{$origPngData}" />
</svg>
SVG;

file_put_contents($svgPath, $svgContent);
echo "favicon.svg created successfully.\n";

