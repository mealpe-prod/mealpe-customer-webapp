import React from 'react';

const AdditionalInstructions = ({ instruction, setInstruction }) => {
  return (
    <div className="bg-white p-4 mb-3 rounded-[12px]">
      <p className="text-sm mb-2">Additional Instruction</p>
      <div className="border border-gray-200 rounded-[12px] p-3">
        <input 
          type="text" 
          placeholder="Type Instruction Here" 
          className="w-full outline-none text-sm"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AdditionalInstructions; 