//
//  DocumentVault.swift
//  iDecide
//
//  Created by hamish leahy on 17/8/2024.
//

import Foundation
import SwiftUI

struct DocumentVaultView: View {
    @State private var documents: [StoredDocument] = []
    @State private var isAddingDocument = false

    var body: some View {
        List {
            ForEach(documents) { document in
                DocumentRow(document: document)
            }
            .onDelete(perform: deleteDocuments)

            Button(action: { isAddingDocument = true }) {
                Label("Add Document", systemImage: "plus")
            }
        }
        .navigationTitle("Document Vault")
        .sheet(isPresented: $isAddingDocument) {
        }
    }

    private func deleteDocuments(at offsets: IndexSet) {
        documents.remove(atOffsets: offsets)
    }
}

struct DocumentRow: View {
    let document: StoredDocument

    var body: some View {
        HStack {
            Image(systemName: "doc.fill")
            VStack(alignment: .leading) {
                Text(document.name)
                Text(document.category)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct AddDocument: View {
    @Binding var documents: [StoredDocument]
    @State private var documentName = ""
    @State private var documentCategory = ""
    @Environment(\.presentationMode) var presentationMode

    var body: some View {
        NavigationView {
            Form {
                TextField("Document Name", text: $documentName)
                TextField("Category", text: $documentCategory)
                Button("Save") {
                    let newDocument = StoredDocument(name: documentName, category: documentCategory)
                    documents.append(newDocument)
                    presentationMode.wrappedValue.dismiss()
                }
            }
            .navigationTitle("Add Document")
        }
    }
}

struct StoredDocument: Identifiable {
    let id = UUID()
    let name: String
    let category: String
}

struct DocumentVaultView_Previews: PreviewProvider {
    static var previews: some View {
        DocumentVaultView()
    }
}
