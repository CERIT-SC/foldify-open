import { useEffect, useRef, useState } from "react";
import Loading from "../Loading";
import RMSDDisplay from "@/app/components/result/ComparisonQualityTable";
import "@/app/components/result/mol-viewer.css";

const MOLSTAR_URL = "https://cdn.jsdelivr.net/npm/molstar";
const MOLSTAR_VERSION = "5.0.0";

// E-infra colors and complementary colors for structure coloring (in 0xRRGGBB format)
const STRUCTURE_COLORS = [
    0x2f2557, // E-infra purple
    0x4cd9f4, // E-infra cyan
    0xdac8fe, // E-infra violet
    0xa1a1b7, // E-infra grey
    0xec4899, // Pink (complementary)
    0xef4444, // Red (complementary)
    0xf59e0b, // Orange (complementary)
    0x22c55e, // Green (complementary)
    0xa855f7, // Purple (complementary)
    0xfbbf24, // Yellow (complementary)
];

interface StructureInfo {
    model: string;
    dataFormat: string;
    rmsd?: number;
    tm_score?: number;
    error?: string;
}

interface MolViewerProps {
    structureData: string | string[] | Record<string, StructureInfo>;
    format: string;
    width?: number;
    height?: string;
    showRMSD?: boolean; // New prop to control RMSD display
    visibleStructures?: Record<string, boolean>;
    onMetricsLoaded?: (rmsdData: Record<string, number>, tmScoreData: Record<string, number>) => void;
    onStructuresLoaded?: (names: string[]) => void;
}

const MolViewer = ({
    structureData,
    format,
    width = 800,
    height,
    showRMSD = false,
    visibleStructures,
    onMetricsLoaded,
    onStructuresLoaded,
}: MolViewerProps) => {
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const viewerInstanceRef = useRef<any>(null);
    const pluginRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const [rmsdData, setRmsdData] = useState<Record<string, number>>({});
    const [tmScoreData, setTmScoreData] = useState<Record<string, number>>({});
    const onMetricsLoadedRef = useRef(onMetricsLoaded);
    onMetricsLoadedRef.current = onMetricsLoaded;
    const onStructuresLoadedRef = useRef(onStructuresLoaded);
    onStructuresLoadedRef.current = onStructuresLoaded;

    useEffect(() => {
        // Basic guards: nothing to do if no data
        if (!structureData) return;
        if (format === "multiple" && Object.keys(structureData as Record<string, any>).length === 0) return;
        setLoading(true);

        const loadMolstar = async () => {
            try {
                // Check if scripts are already loaded
                if (!window.molstar) {
                    // Load Mol* scripts and styles
                    const script = document.createElement("script");
                    script.src = `${MOLSTAR_URL}@${MOLSTAR_VERSION}/build/viewer/molstar.js`;
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });

                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = `${MOLSTAR_URL}@${MOLSTAR_VERSION}/build/viewer/molstar.css`;
                    await new Promise((resolve, reject) => {
                        link.onload = resolve;
                        link.onerror = reject;
                        document.head.appendChild(link);
                    });
                }

                if (!viewerRef.current) return;

                // Clean up previous viewer instance
                if (viewerInstanceRef.current) {
                    try {
                        viewerInstanceRef.current.dispose();
                    } catch (e) {
                        console.warn("Error disposing previous viewer:", e);
                    }
                    viewerInstanceRef.current = null;
                    pluginRef.current = null;
                }

                // Create Viewer instance
                const viewer = await window.molstar.Viewer.create(viewerRef.current, {
                    layoutIsExpanded: false,
                    layoutShowControls: false,
                });

                // Store viewer instance for cleanup
                viewerInstanceRef.current = viewer;
                const plugin = viewer.plugin;
                pluginRef.current = plugin;

                // Access the plugin through the viewer instance
                // Set white background for all viewers
                plugin.canvas3d?.setProps({
                    trackball: height === "20rem" ? { animate: { name: "spin", params: { speed: 0.2 } } } : {},
                });

                // If multiple structures are passed, iterate and load each one
                if (format === "multiple") {
                    const entries = Object.entries(structureData as Record<string, StructureInfo>);
                    const rmsdValues: Record<string, number> = {};
                    const tmScoreValues: Record<string, number> = {};

                    for (let i = 0; i < entries.length; i++) {
                        const [name, item] = entries[i];
                        const colorValue = STRUCTURE_COLORS[i % STRUCTURE_COLORS.length];

                        try {
                            // Store RMSD and TM-score if available
                            if (item.rmsd !== undefined) {
                                rmsdValues[name] = item.rmsd;
                            }
                            if (item.tm_score !== undefined) {
                                tmScoreValues[name] = item.tm_score;
                            }

                            // Load structure with custom label (name)
                            const data = await plugin.builders.data.rawData({ data: item.model, label: name });
                            const traj = await plugin.builders.structure.parseTrajectory(data, item.dataFormat);

                            // Use a uniform loading path for all formats so that each structure cell
                            // carries a predictable label for visibility toggling.
                            const model = await plugin.builders.structure.createModel(traj);
                            const structure = await plugin.builders.structure.createStructure(model, { label: name });

                            // Create components
                            const components = {
                                polymer: await plugin.builders.structure.tryCreateComponentStatic(structure, "polymer"),
                                ligand: await plugin.builders.structure.tryCreateComponentStatic(structure, "ligand"),
                            };

                            // Create representations with custom e-infra colors for multi-structure comparison
                            if (components.polymer) {
                                await plugin.builders.structure.representation.addRepresentation(components.polymer, {
                                    type: "cartoon",
                                    color: "uniform",
                                    colorParams: { value: colorValue },
                                });
                            }

                            if (components.ligand) {
                                await plugin.builders.structure.representation.addRepresentation(components.ligand, {
                                    type: "ball-and-stick",
                                    color: "uniform",
                                    colorParams: { value: colorValue },
                                });
                            }
                        } catch (e) {
                            console.warn(`Failed to load structure ${name}:`, e);
                        }
                    }

                    // Store RMSD and TM-score data for display
                    setRmsdData(rmsdValues);
                    setTmScoreData(tmScoreValues);
                    onMetricsLoadedRef.current?.(rmsdValues, tmScoreValues);
                    onStructuresLoadedRef.current?.(entries.map(([name]) => name));

                    // Focus camera on loaded structures
                    await plugin.managers.camera.focusLoci(plugin.managers.structure.hierarchy.current.structures);
                } else {
                    // Single structure flow (existing behavior)
                    const data = await plugin.builders.data.rawData({ data: structureData });
                    const trajectory = await plugin.builders.structure.parseTrajectory(data, format);

                    if (format === "mmcif") {
                        await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
                    } else {
                        const model = await plugin.builders.structure.createModel(trajectory);
                        const structure = await plugin.builders.structure.createStructure(model);

                        const components = {
                            polymer: await plugin.builders.structure.tryCreateComponentStatic(structure, "polymer"),
                            ligand: await plugin.builders.structure.tryCreateComponentStatic(structure, "ligand"),
                        };

                        const builder = plugin.builders.structure.representation;
                        const update = plugin.build();

                        if (components.polymer) {
                            await builder.buildRepresentation(update, components.polymer, {
                                type: "cartoon",
                                color: "plddt-confidence",
                            });
                        }

                        if (components.ligand) {
                            await builder.buildRepresentation(update, components.ligand, {
                                type: "ball-and-stick",
                                color: "plddt-confidence",
                            });
                        }
                        await update.commit();
                    }
                }
            } catch (error) {
                console.error("Failed to load Molstar", error);
            } finally {
                setLoading(false);
            }
        };

        loadMolstar();

        return () => {
            if (viewerInstanceRef.current) {
                try {
                    viewerInstanceRef.current.dispose();
                } catch (e) {
                    console.warn("Error disposing viewer on cleanup:", e);
                }
                viewerInstanceRef.current = null;
                pluginRef.current = null;
            }
        };
    }, [structureData, format, height]);

    // Effect to toggle structure visibility based on visibleStructures prop
    useEffect(() => {
        const plugin = pluginRef.current;
        if (!plugin || !visibleStructures) return;

        const structures = plugin.managers?.structure?.hierarchy?.current?.structures || [];
        structures.forEach((sRef: any) => {
            const label = sRef.cell?.obj?.label;
            const ref = sRef.cell?.transform?.ref;
            if (label && ref && label in visibleStructures) {
                const isHidden = !visibleStructures[label];
                plugin.state.data.setCellState(ref, { isHidden });
                // Also hide/show components under this structure to ensure full toggle
                sRef.components?.forEach((compRef: any) => {
                    const compRefId = compRef.cell?.transform?.ref;
                    if (compRefId) {
                        plugin.state.data.setCellState(compRefId, { isHidden });
                    }
                });
            }
        });
    }, [visibleStructures]);

    return (
        <>
            {loading && <Loading />}
            <div
                className={`molstar-wrapper ${height === "20rem" ? "molstar-no-ui" : ""}`}
                style={{
                    width: "100%",
                    height: height || "40rem",
                    position: "relative",
                    minWidth: "300px",
                    backgroundColor: "#ffffff",
                }}
                ref={viewerRef}></div>
            {showRMSD && (
                <RMSDDisplay
                    rmsdData={rmsdData}
                    tmScoreData={tmScoreData}
                />
            )}
        </>
    );
};

export default MolViewer;
