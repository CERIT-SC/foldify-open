"use client";

import {useState} from "react";
import {AlphaFold3JsonForm} from "@/app/components/alphafold3/AlphaFold3JsonForm";
import AlphaFold3AdvancedForm from "@/app/components/alphafold3/AlphaFold3AdvancedForm";
import {DocumentTextIcon, CogIcon} from "@heroicons/react/24/outline";

import {BackHomeButton} from "@/app/components/BackHomeButton";

export default function Af3Page() {
    const [useJsonMode, setUseJsonMode] = useState<boolean>(false);

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <BackHomeButton/>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-primary mb-4">AlphaFold 3</h1>
                    <p className="text-md text-base-content/70 max-w-3xl mx-auto leading-relaxed">
                        Predict protein structures with enhanced accuracy using AlphaFold 3. Configure your job
                        parameters below and submit for
                        computation.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="card bg-white/50 shadow-2xl">
                        <div className="card-body p-8 md:p-12">
                            <div
                                className="flex items-center justify-between mb-8 p-4 bg-base-100/20 rounded-xl border border-base-300">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            !useJsonMode ? "bg-primary/10" : "bg-base-300"
                                        }`}>
                                        <CogIcon
                                            className={`w-5 h-5 ${!useJsonMode ? "text-primary" : "text-base-content/60"}`}/>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base-content">{useJsonMode ? "JSON Configuration" : "Input Form"}</h3>
                                        <p className="text-sm text-base-content/60">
                                            {useJsonMode ? "Upload a pre-configured JSON file" : "Guided step-by-step configuration"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                        <span
                                            className="text-sm text-base-content/70">{useJsonMode ? "Switch to Form" : "Use JSON instead?"}</span>
                                    <button
                                        onClick={() => setUseJsonMode(!useJsonMode)}
                                        className={`btn btn-sm gap-2 ${useJsonMode ? "btn-primary" : "btn-outline btn-secondary"}`}>
                                        {useJsonMode ? (
                                            <>
                                                <CogIcon className="w-4 h-4"/>
                                                Form Mode
                                            </>
                                        ) : (
                                            <>
                                                <DocumentTextIcon className="w-4 h-4"/>
                                                JSON Mode
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {useJsonMode ? <AlphaFold3JsonForm/> : <AlphaFold3AdvancedForm/>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
