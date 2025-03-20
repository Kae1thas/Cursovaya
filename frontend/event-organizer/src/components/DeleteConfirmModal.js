import React from "react";
import Modal from "react-modal";
import { motion } from "framer-motion";

Modal.setAppElement("#root");

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, eventToDelete }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1000 },
        content: {
          maxWidth: "500px",
          margin: "auto",
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "white",
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 flex flex-col"
      >
        <h2 className="text-lg font-semibold text-center mb-6">
          Вы уверены, что хотите удалить мероприятие{" "}
          <span className="font-bold">"{eventToDelete?.title}"</span>?
        </h2>
        <div className="flex justify-between">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 transition-colors"
          >
            Удалить
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 transition-colors"
          >
            Отмена
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default DeleteConfirmModal;