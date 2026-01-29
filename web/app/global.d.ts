interface Window {
    molstar: {
        Viewer: Viewer;
    }
}

// https://github.com/molstar/molstar/blob/master/src/apps/viewer/app.ts
interface Viewer {
    plugin: PluginUIContext;
    constructor(plugin: PluginUIContext): void;
    create(elementOrId: string | HTMLElement, options?: Partial<ViewerOptions>): Promise<Viewer>;
    setRemoteSnapshot(id: string): Promise<void>;
    loadSnapshotFromUrl(url: string, type: PluginState.SnapshotType): Promise<void>;
    loadStructureFromUrl(url: string, format?: BuiltInTrajectoryFormat, isBinary?: boolean, options?: LoadStructureOptions & { label?: string }): Promise<void>;
    loadAllModelsOrAssemblyFromUrl(url: string, format?: BuiltInTrajectoryFormat, isBinary?: boolean, options?: LoadStructureOptions): Promise<void>;
    loadStructureFromData(data: string | number[], format: BuiltInTrajectoryFormat, options?: { dataLabel?: string }): Promise<void>;
    loadPdb(pdb: string, options?: LoadStructureOptions): Promise<void>;
    loadPdbDev(pdbDev: string): Promise<void>;
    loadEmdb(emdb: string, options?: { detail?: number }): Promise<void>;
    loadAlphaFoldDb(afdb: string): Promise<void>;
    loadModelArchive(id: string): Promise<void>;
    loadVolumeFromUrl({ url, format, isBinary }: { url: string; format: BuildInVolumeFormat; isBinary: boolean }, isovalues: VolumeIsovalueInfo[], options?: { entryId?: string | string[]; isLazy?: boolean }): Promise<void>;
    loadMvsFromUrl(url: string, format: 'mvsj' | 'mvsx', options?: { replaceExisting?: boolean; keepCamera?: boolean }): Promise<void>;
    loadMvsData(data: string | Uint8Array, format: 'mvsj' | 'mvsx', options?: { replaceExisting?: boolean }): Promise<void>;
    handleResize(): void;
    dispose(): void;
}

interface LoadStructureOptions {
    representationParams?: StructureRepresentationPresetProvider.CommonParams;
}

interface VolumeIsovalueInfo {
    type: 'absolute' | 'relative';
    value: number;
    color: Color;
    alpha?: number;
    volumeIndex?: number;
}
