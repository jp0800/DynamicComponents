Sure! Here’s a PowerShell script to help you download the Ubuntu appx package, extract it to D:\WSL\Ubuntu, and register it as a WSL distro named UbuntuD — all in one go.


---

# === PowerShell script to install Ubuntu WSL distro on Drive D ===

# Variables - customize if needed
$downloadUrl = "https://aka.ms/wslubuntu2004"   # Ubuntu 20.04 LTS direct download link
$downloadPath = "$env:TEMP\Ubuntu_2004.appx"
$extractPath = "D:\WSL\Ubuntu"
$rootfsTar = "$extractPath\rootfs.tar"
$distroName = "UbuntuD"

# Create the target directory on D:
if (-Not (Test-Path -Path $extractPath)) {
    Write-Host "Creating directory $extractPath"
    New-Item -ItemType Directory -Path $extractPath | Out-Null
}

# Download the Ubuntu appx package
Write-Host "Downloading Ubuntu appx package..."
Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath

# Extract the appx package (it's a ZIP archive)
Write-Host "Extracting appx package to $extractPath ..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($downloadPath, $extractPath)

# Check for the rootfs file inside extracted folder (usually inside 'ubuntu.exe' folder)
# The root filesystem is typically a tar file embedded as 'install.tar.gz' or 'rootfs.tar'
# Let's find install.tar.gz or rootfs.tar
$tarFile = Get-ChildItem -Path $extractPath -Recurse -Include "install.tar.gz","rootfs.tar" | Select-Object -First 1

if (-not $tarFile) {
    Write-Error "Could not find rootfs tarball inside extracted files. Please check extraction."
    exit 1
}

# If it's install.tar.gz, extract it to rootfs.tar (uncompressed)
if ($tarFile.Extension -eq ".gz") {
    Write-Host "Extracting install.tar.gz to rootfs.tar..."
    $gzipStream = [IO.Compression.GzipStream]::new([IO.File]::OpenRead($tarFile.FullName), [IO.Compression.CompressionMode]::Decompress)
    $outStream = [IO.File]::Create($rootfsTar)
    $gzipStream.CopyTo($outStream)
    $gzipStream.Dispose()
    $outStream.Dispose()
} else {
    # If rootfs.tar exists, just copy it to rootfs.tar in extractPath
    Copy-Item -Path $tarFile.FullName -Destination $rootfsTar -Force
}

# Register the extracted rootfs as a new WSL distro on Drive D:
Write-Host "Registering WSL distro $distroName with rootfs from $rootfsTar..."
wsl --import $distroName $extractPath $rootfsTar --version 2

# Set the new distro as default
Write-Host "Setting $distroName as default WSL distro..."
wsl --set-default $distroName

Write-Host "Done! You can now launch Ubuntu on D: using: wsl -d $distroName"


---

How to use:

1. Open PowerShell as Administrator


2. Copy & paste this entire script and run it


3. Wait for download, extraction, and registration to complete


4. Run wsl -d UbuntuD to start Ubuntu from Drive D:




---

Notes:

The script downloads Ubuntu 20.04 (focal) by default — change $downloadUrl for other versions if needed.

Make sure Drive D: has enough free space (~2-4GB).

You can rename $distroName if you want a different WSL distro name.

After this, you can continue your Node, Python, Docker setup inside this Ubuntu instance.



---

Want me to help you automate the rest of the Node, Python, Docker installs inside WSL too?

