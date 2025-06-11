import { Link } from "react-router-dom";
import React from "react";
import { useState } from 'react';
import { MoreVertical } from "lucide-react";
import { CSS } from '@dnd-kit/utilities';
import { Board } from "../pages/DashboardPage";
type BoardCardProps = {
    board: Board;
    onDelete: (id: string) => void;
    onEdit: (board: Board) => void;
    onShare: (board: Board) => void;
};

const BoardCard = ({board, onDelete, onEdit, onShare}: BoardCardProps) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="relative bg-white dark:bg-gray-700 text-black dark:text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
        {/* Three-dot menu button */}
        <button
            onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((open) => !open);
            }}
            className="absolute top-2 right-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white p-1"
        >
            <MoreVertical size={20} />
        </button>

        {menuOpen && (
            <div
            className="absolute top-8 right-2 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-md z-50"
            onClick={(e) => e.stopPropagation()}
            >
            <button
                onClick={() => {
                setMenuOpen(false);
                onEdit(board);
                }}
                className="block w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
            >
                Edit
            </button>

            <button
                onClick={() => {
                setMenuOpen(false);
                onShare(board);
                }}
                className="block w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
            >
                Share
            </button>

            <button
                onClick={() => {
                setMenuOpen(false);
                onDelete(board.id);
                }}
                className="block w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-red-600"
            >
                Delete
            </button>
            </div>
        )}

        {/* Board info */}
        <h3 className="text-xl font-semibold">{board.title}</h3>
        <p className="text-gray-500 dark:text-gray-300">{board.description}</p>
        <Link
            to={`/board/${board.id}`}
            className="text-blue-500 hover:text-blue-700 mt-4 inline-block"
        >
            View Board
        </Link>
        </div>
    );
};

export default BoardCard;