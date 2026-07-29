"use client";

import { useState, useMemo } from "react";
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

  // Assets counts per tab
  const tabCounts = useMemo(() => {
    const images = assets.filter((a) =>
      ["JPG", "PNG", "GIF"].includes(a.type)
    ).length;
    const videos = assets.filter((a) => a.type === "MP4").length;
    const html5 = assets.filter((a) => a.type === "HTML5").length;
    return { image: images, video: videos, html5 };
  }, [assets]);

  // Filter assets by folder, tab, and search query
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Folder filter
      if (activeFolderId !== "all" && asset.folderId !== activeFolderId) {
        return false;
      }
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
  }, [assets, activeFolderId, activeTab, searchQuery]);

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
      breadcrumbs={[{ label: "home", href: "/" }, { label: "Creative Assets" }]}
      activeHref="/creative-assets"
    >
      <div className="flex min-h-full">
        {/* Left Folders Sidebar */}
        <FoldersSidebar
          folders={foldersWithCounts}
          activeFolderId={activeFolderId}
          onSelectFolder={setActiveFolderId}
          onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
          onDeleteFolder={handleDeleteFolder}
          totalAssetCount={assets.length}
        />

        {/* Main Assets Content */}
        <main className="flex-1 pl-8">
          {/* Header Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold leading-8 text-epom-text">
                Creative Assets
              </h1>
              <button
                type="button"
                className="text-epom-muted hover:text-epom-text"
                title="More actions"
              >
                <MaterialIcon name="more_horiz" className="text-[20px]" />
              </button>
              <button
                type="button"
                className="text-epom-muted hover:text-epom-text"
                title="Learn about Creative Assets"
              >
                <MaterialIcon name="help_outline" className="text-[20px]" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-epom-primary px-4 py-2 text-[14px] font-medium text-white shadow-xs transition-opacity hover:opacity-90"
            >
              <MaterialIcon name="cloud_upload" className="text-[18px]" />
              Upload Asset
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 border-b border-epom-border">
            <nav className="-mb-px flex gap-6" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab("image")}
                className={`flex items-center gap-2 border-b-2 py-3 text-[14px] font-medium transition-colors ${
                  activeTab === "image"
                    ? "border-epom-primary text-epom-primary"
                    : "border-transparent text-epom-muted hover:border-gray-300 hover:text-epom-text"
                }`}
              >
                Images ({tabCounts.image})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("video")}
                className={`flex items-center gap-2 border-b-2 py-3 text-[14px] font-medium transition-colors ${
                  activeTab === "video"
                    ? "border-epom-primary text-epom-primary"
                    : "border-transparent text-epom-muted hover:border-gray-300 hover:text-epom-text"
                }`}
              >
                Videos ({tabCounts.video})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("html5")}
                className={`flex items-center gap-2 border-b-2 py-3 text-[14px] font-medium transition-colors ${
                  activeTab === "html5"
                    ? "border-epom-primary text-epom-primary"
                    : "border-transparent text-epom-muted hover:border-gray-300 hover:text-epom-text"
                }`}
              >
                HTML5 ({tabCounts.html5})
              </button>
            </nav>
          </div>

          {/* Filter / Search Bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="h-10 w-full rounded-lg border border-epom-border bg-epom-surface pl-3 pr-10 text-[14px] text-epom-text shadow-2xs focus:border-epom-primary focus:outline-none"
              />
              <MaterialIcon
                name="search"
                className="pointer-events-none absolute right-3 top-2.5 block text-[20px] text-epom-muted"
              />
            </div>
          </div>

          {/* Assets Table */}
          <AssetsTable
            assets={filteredAssets}
            onPreviewAsset={(asset) => setPreviewAsset(asset)}
            onDeleteAsset={handleDeleteAsset}
          />
        </main>

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
