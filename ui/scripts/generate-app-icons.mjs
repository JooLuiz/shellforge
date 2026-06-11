import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const scriptDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const uiRootPath = path.resolve(scriptDirectoryPath, "..");
const sourceSvgPath = path.join(
  uiRootPath,
  "src",
  "renderer",
  "assets",
  "logo",
  "shell-forge-mark.svg"
);
const iconsDirectoryPath = path.join(uiRootPath, "resources", "icons");
const icoOutputPath = path.join(iconsDirectoryPath, "shell-forge-mark.ico");
const pngOutputPath = path.join(iconsDirectoryPath, "shell-forge-mark.png");

const icoSizes = [16, 32, 48, 256];
const linuxPngSize = 256;

async function generateAppIcons() {
  if (!fs.existsSync(sourceSvgPath)) {
    throw new Error(`Source SVG not found: "${sourceSvgPath}"`);
  }

  fs.mkdirSync(iconsDirectoryPath, { recursive: true });

  const icoPngBuffers = await Promise.all(
    icoSizes.map((size) =>
      sharp(sourceSvgPath).resize(size, size).png().toBuffer()
    )
  );

  const icoBuffer = await toIco(icoPngBuffers);
  fs.writeFileSync(icoOutputPath, icoBuffer);

  const linuxPngBuffer = await sharp(sourceSvgPath)
    .resize(linuxPngSize, linuxPngSize)
    .png()
    .toBuffer();
  fs.writeFileSync(pngOutputPath, linuxPngBuffer);

  console.log("generateAppIcons - icoOutputPath");
  console.log(icoOutputPath);
  console.log("generateAppIcons - pngOutputPath");
  console.log(pngOutputPath);
}

generateAppIcons().catch((error) => {
  console.error("generateAppIcons - error");
  console.error(error);
  process.exitCode = 1;
});
