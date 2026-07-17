import type { CSSProperties, ReactNode } from "react";
export type CanvasSystemMode = "interactive" | "print" | "presentation";
export type CanvasSystemSection = {
    id: string;
    title: string;
    description: string;
    gridPosition: {
        column: number;
        row: number;
        colSpan: number;
        rowSpan: number;
    };
    fillOrder: number;
    highlight: boolean;
    journeySteps: boolean;
    defaultNoteColor: string;
    defaultNoteIntent: string;
};
export type CanvasSystemNote = {
    id: string;
    text: string;
    color?: string;
};
export type CanvasSystemMetadata = {
    title: string;
    owner: string;
    context: string;
    date: string;
};
export declare function canvasSectionNumber(section: CanvasSystemSection): string;
export declare function canvasSectionGridStyle(section: CanvasSystemSection): CSSProperties;
export declare function CanvasSystemShell({ mode, focusOnly, title, kicker, description, toolbar, children, metadata, }: {
    mode?: CanvasSystemMode;
    focusOnly?: boolean;
    title: string;
    kicker?: string;
    description?: string;
    toolbar?: ReactNode;
    children: ReactNode;
    metadata?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function CanvasSystemGrid({ columns, rows, children, }: {
    columns: number;
    rows: number;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function CanvasSystemNoteView({ note, editable, color, intent, deleteLabel, onChange, onDelete, }: {
    note: CanvasSystemNote;
    editable: boolean;
    color: string;
    intent: string;
    deleteLabel: string;
    onChange?: (text: string) => void;
    onDelete?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function CanvasSystemZone({ section, active, mode, notes, addLabel, deleteLabel, noteInput, onActivate, onNoteChange, onNoteDelete, onAddNote, }: {
    section: CanvasSystemSection;
    active?: boolean;
    mode?: CanvasSystemMode;
    notes: CanvasSystemNote[];
    addLabel: string;
    deleteLabel: string;
    noteInput?: ReactNode;
    onActivate?: () => void;
    onNoteChange?: (noteId: string, text: string) => void;
    onNoteDelete?: (noteId: string) => void;
    onAddNote?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function CanvasSystemMetadataEditor({ metadata, labels, onChange, }: {
    metadata: CanvasSystemMetadata;
    labels: {
        title: string;
        owner: string;
        context: string;
        date: string;
    };
    onChange: (metadata: CanvasSystemMetadata) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function CanvasSystemMetadataReadOnly({ metadata, labels, }: {
    metadata: CanvasSystemMetadata;
    labels: {
        title: string;
        owner: string;
        context: string;
        date: string;
    };
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map