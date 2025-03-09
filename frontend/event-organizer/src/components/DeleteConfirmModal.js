import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Устанавливаем корневой элемент для react-modal

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <div className="bg-white p-8 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Вы уверены, что хотите удалить это мероприятие?</h2>
        <div className="flex justify-between">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
          >
            Удалить
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
