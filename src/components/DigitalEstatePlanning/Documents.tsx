import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, AlertCircle } from 'lucide-react';

export function Documents() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-8 border border-blue-100"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Digital Documents</h2>
            <p className="text-gray-600">Store and organize your important digital documents</p>
          </div>
        </div>

        <div className="bg-white/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-blue-600">
            <Upload size={20} />
            <p className="font-medium">Coming Soon</p>
          </div>
          <p className="mt-2 text-gray-600">
            The Digital Documents feature is currently under development. Soon you'll be able to:
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Upload and store important documents securely
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Organize documents by category
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Share documents with trusted deputies
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Set access permissions and expiration dates
            </li>
          </ul>
        </div>

        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
          <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
          <p className="text-sm text-amber-800">
            While this feature is being developed, we recommend maintaining a secure cloud storage
            solution for your important documents. Make sure to document access information and
            share it with your trusted deputies.
          </p>
        </div>
      </motion.div>
    </div>
  );
}