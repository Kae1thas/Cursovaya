import React from 'react';
import Modal from 'react-modal';
import { motion } from 'framer-motion';

Modal.setAppElement('#root'); // Убедимся, что модальное окно работает корректно

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal 
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Прозрачный черный фон
          zIndex: 1000, // Чтобы модальное окно было сверху
        },
        content: {
          maxWidth: '500px',
          margin: 'auto', // Центрирование окна по экрану
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: 'white', // Белый фон модального окна
          position: 'relative', // Чтобы окно не выходило за пределы
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 flex flex-col"
      >
        <h2 className="text-lg font-semibold text-center mb-6">
          Вы уверены, что хотите удалить это мероприятие?
        </h2>
        <div className="flex justify-between">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600"
          >
            Удалить
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600"
          >
            Отмена
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default DeleteConfirmModal;
