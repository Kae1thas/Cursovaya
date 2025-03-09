import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 flex flex-col">
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
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
