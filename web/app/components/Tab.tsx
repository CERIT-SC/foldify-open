"use client";

import React, { useState, ReactNode } from "react";

interface TabProps {
    label: string;
    children: ReactNode;
}

interface TabsProps {
    children: React.ReactElement<TabProps>[];
}

const Tabs = ({ children }: TabsProps) => {
    const [activeTab, setActiveTab] = useState(children[0].props.label);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, newActiveTab: string) => {
        e.preventDefault();
        setActiveTab(newActiveTab);
    };

    return (
        <>
            <div className="flex">
                {children.map((child) => (
                    <button
                        key={child.props.label}
                        className={`${
                            activeTab === child.props.label ? "border-b-4 border-primary" : ""
                        } flex-1 font-medium py-2 hover:font-bold hover:text-primary`}
                        onClick={(e) => handleClick(e, child.props.label)}>
                        {child.props.label}
                    </button>
                ))}
            </div>
            <div className="py-4">
                {children.map((child) => {
                    if (child.props.label === activeTab) {
                        return <div key={child.props.label}>{child.props.children}</div>;
                    }
                    return null;
                })}
            </div>
        </>
    );
};

const Tab = ({ label, children }: TabProps) => {
    return <div>{children}</div>;
};

export { Tabs, Tab };
