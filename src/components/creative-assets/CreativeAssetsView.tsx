"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { FoldersSidebar } from "./FoldersSidebar";
import { AssetsTable } from "./AssetsTable";
import { UploadAssetModal } from "./UploadAssetModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { PreviewAssetModal } from "./PreviewAssetModal";
import { DEFAULT_FOLDERS, INITIAL_ASSETS } from "@/lib/creative-assets-data";
import type { CreativeAsset, Folder } from "@/types/creative-asset";

type TabType = "image" | "video" | "html5";

const TABS: { id: TabType; label: string }[] = [
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "html5", label: "HTML5" },
];

export function CreativeAssetsView() {
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [assets, setAssets] = useState<CreativeAsset[]>(INITIAL_ASSETS);
  const [activeFolderId, setActiveFolderId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("image");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<CreativeAsset | null>(null);

  // Folder asset counts calculation
  const foldersWithCounts = useMemo(() => {
    return folders.map((folder) => {
      const count =
        folder.id === "all"
          ? assets.length
          : assets.filter((a) => a.folderId === folder.id).length;
      return { ...folder, assetCount: count };
    });
  }, [folders, assets]);

  // The folder in view. Both the tab counts and the table read from this, so a
  // tab never advertises assets the selected folder does not hold.
  const folderAssets = useMemo(
    () =>
      activeFolderId === "all"
        ? assets
        : assets.filter((a) => a.folderId === activeFolderId),
    [assets, activeFolderId],
  );

  // Assets counts per tab
  const tabCounts = useMemo(() => {
    const images = folderAssets.filter((a) =>
      ["JPG", "PNG", "GIF"].includes(a.type)
    ).length;
    const videos = folderAssets.filter((a) => a.type === "MP4").length;
    const html5 = folderAssets.filter((a) => a.type === "HTML5").length;
    return { image: images, video: videos, html5 };
  }, [folderAssets]);

  // Filter the folder's assets by tab and search query
  const filteredAssets = useMemo(() => {
    return folderAssets.filter((asset) => {
      // Tab filter
      if (activeTab === "image" && !["JPG", "PNG", "GIF"].includes(asset.type)) {
        return false;
      }
      if (activeTab === "video" && asset.type !== "MP4") {
        return false;
      }
      if (activeTab === "html5" && asset.type !== "HTML5") {
        return false;
      }
      // Search filter
      if (
        searchQuery &&
        !asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [folderAssets, activeTab, searchQuery]);

  // Action handlers
  const handleCreateFolder = (folderName: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: folderName,
    };
    setFolders((prev) => [...prev, newFolder]);
    setActiveFolderId(newFolder.id);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (activeFolderId === folderId) {
      setActiveFolderId("all");
    }
  };

  const handleUploadSuccess = (assetName: string, folderId: string) => {
    const isVideo = assetName.toLowerCase().endsWith(".mp4");
    const isHtml5 = assetName.toLowerCase().endsWith(".zip");
    const type = isVideo ? "MP4" : isHtml5 ? "HTML5" : "PNG";

    const newAsset: CreativeAsset = {
      id: `asset-${Date.now()}`,
      name: assetName,
      folderId: folderId,
      previewUrl: isVideo
        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        : "/images/Home_ANM.jpg",
      dimensions: isVideo ? "1920x1080" : "300x250",
      fileSizeKb: isVideo ? 3200 : 45,
      type,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  return (
    <AppShell
      breadcrumbs={[{ label: "Creative Assets" }]}
      activeHref="/creative-assets"
    >
      {/* .page-content-grid — 260px folder rail, then the padded main column. */}
      <div className="grid gap-8" style={{ gridTemplateColumns: "228px 1fr" }}>
        <FoldersSidebar
          folders={foldersWithCounts}
          activeFolderId={activeFolderId}
          onSelectFolder={setActiveFolderId}
          onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
          onDeleteFolder={handleDeleteFolder}
        />

        {/* .main cancels the wrapper padding and re-applies its own. */}
        <div className="-m-8 overflow-auto p-8">
          <div className="flex h-9 items-center">
            <h1 className="text-[20px] font-bold leading-6 text-epom-text">Creative Assets</h1>
            <button
              type="button"
              title="More actions"
              aria-label="More actions"
              // Inert until a folder is selected on the live site, hence the 0.5 opacity.
              className="ml-2 flex h-[22px] w-8 items-center justify-center px-1.5 py-px text-epom-primary opacity-50"
            >
              <MaterialIcon name="more_horiz" className="block text-[16px] leading-5" />
            </button>
            <a
              href="https://help.dsp.epom.com/docs/creative-assets"
              target="_blank"
              rel="noreferrer"
              title="Learn about Creative Assets"
              aria-label="Learn about Creative Assets"
              className="ml-2 flex h-5 w-5 text-epom-primary transition-colors duration-[120ms] ease-linear hover:text-epom-primary-hover"
            >
              <MaterialIcon name="help_outline" className="block text-[16px] leading-5" />
            </a>

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="ml-auto flex h-9 min-w-24 items-center gap-2 rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
            >
              <MaterialIcon name="cloud_upload" className="block text-[16px] leading-4" />
              Upload Asset
            </button>
          </div>

          {/* .sub-menu-block — 16px above and below the tab strip. */}
          <nav className="my-4">
            <ul className="flex h-[34px] border-b border-epom-border">
              {TABS.map((tab, i) => (
                <li key={tab.id} className="relative -mb-px flex h-[34px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex h-[34px] items-center border-b-2 pb-2 pt-1 text-[16px] font-semibold leading-[21px] transition-colors duration-[120ms] ease-linear",
                      i > 0 && "ml-8",
                      activeTab === tab.id
                        ? "border-epom-primary text-epom-primary"
                        : "border-transparent text-epom-muted hover:text-epom-primary-hover",
                    )}
                  >
                    {tab.label} ({tabCounts[tab.id]})
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* .filters-container */}
          <div className="mb-4 flex justify-between rounded bg-epom-surface p-4">
            <div className="relative w-[364px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="h-9 w-full rounded border border-epom-border bg-epom-surface py-2 pl-3 pr-9 text-[14px] leading-5 text-epom-text transition-[border-color] duration-150 ease-in-out focus:border-epom-primary focus:outline-none"
              />
              <MaterialIcon
                name="search"
                className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
              />
            </div>
          </div>

          <AssetsTable
            assets={filteredAssets}
            onPreviewAsset={(asset) => setPreviewAsset(asset)}
            onDeleteAsset={handleDeleteAsset}
          />
        </div>

        {/* Modals */}
        <UploadAssetModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          folders={folders}
          activeFolderId={activeFolderId}
          onUploadSuccess={handleUploadSuccess}
        />

        <CreateFolderModal
          isOpen={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          onCreateFolder={handleCreateFolder}
        />

        <PreviewAssetModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
        />
      </div>
    </AppShell>
  );
}
