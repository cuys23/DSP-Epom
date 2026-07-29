export type AssetType = "JPG" | "PNG" | "GIF" | "MP4" | "HTML5";

export interface CreativeAsset {
  id: string;
  name: string;
  folderId: string;
  previewUrl: string;
  dimensions: string; // e.g. "841x412"
  width?: number;
  height?: number;
  fileSizeKb: number;
  type: AssetType;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  assetCount?: number;
}
