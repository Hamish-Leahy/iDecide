//
//  LegalMattersView.swift
//  iDecide
//
//  Created by hamish leahy on 17/8/2024.
//



import SwiftUI
import CoreData
import UniformTypeIdentifiers

struct LegalMattersView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    let subsections = [
        LegalSubsection(title: "Will and Testament", icon: "doc.text"),
        LegalSubsection(title: "Power of Attorney", icon: "person.text.rectangle"),
        LegalSubsection(title: "Living Trust", icon: "building.columns"),
        LegalSubsection(title: "Healthcare Directive", icon: "heart.text.square"),
        LegalSubsection(title: "Beneficiary Designations", icon: "person.3"),
        LegalSubsection(title: "Estate Planning Documents", icon: "folder")
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                welcomeSection
                
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(subsections) { subsection in
                        NavigationLink(destination: LegalSubsectionView(title: subsection.title)) {
                            LegalSubsectionCard(subsection: subsection)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Legal Matters")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Legal Matters")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Ensure your wishes are legally protected")
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
        .shadow(radius: 5)
        .padding(.horizontal)
    }
}

struct LegalSubsectionView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest var documents: FetchedResults<LegalDocument>
    @State private var isShowingDocumentPicker = false
    
    let title: String
    
    init(title: String) {
        self.title = title
        _documents = FetchRequest<LegalDocument>(
            sortDescriptors: [NSSortDescriptor(keyPath: \LegalDocument.dateUploaded, ascending: false)],
            predicate: NSPredicate(format: "section == %@", title)
        )
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionDivider(title: "Tips")
                TipsView(title: title)
                
                SectionDivider(title: "Templates")
                TemplatesView(title: title)
                
                SectionDivider(title: "Documents")
                DocumentListView(documents: documents, isShowingDocumentPicker: $isShowingDocumentPicker)
            }
            .padding()
        }
        .background(Color(.systemBackground))
        .navigationTitle(title)
        .navigationBarItems(trailing: Button(action: {
            isShowingDocumentPicker = true
        }) {
            Image(systemName: "plus")
                .foregroundColor(.blue)
                .font(.system(size: 20, weight: .semibold))
        })
        .sheet(isPresented: $isShowingDocumentPicker) {
            DocumentPicker(subsection: title)
        }
    }
}

struct SectionDivider: View {
    let title: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
            
            Divider()
                .background(Color.blue.opacity(0.5))
                .frame(height: 2)
        }
        .padding(.top, 10)
    }
}

struct TipsView: View {
    let title: String
    let tipBoxHeight: CGFloat = 100 // Fixed height for tip boxes
    
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 15) {
            ForEach(getTips(), id: \.self) { tip in
                TipBox(tip: tip)
                    .frame(height: tipBoxHeight)
            }
        }
    }
    
    private func getTips() -> [String] {
        switch title {
        case "Will and Testament":
            return [
                "Review and update your will regularly, especially after major life events.",
                "Clearly state your beneficiaries and what they will receive.",
                "Consider naming an executor to manage your estate.",
                "Be specific about the distribution of sentimental items."
            ]
        case "Power of Attorney":
            return [
                "Choose someone you trust completely to act on your behalf.",
                "Specify whether it's a general or limited power of attorney.",
                "Consider setting up both financial and healthcare power of attorney.",
                "Regularly review and update your power of attorney documents."
            ]
        case "Living Trust":
            return [
                "Determine if a living trust is right for your situation.",
                "Choose a trustee to manage the trust assets.",
                "Decide which assets to include in the trust.",
                "Remember to transfer ownership of assets to the trust."
            ]
        case "Healthcare Directive":
            return [
                "Clearly state your wishes for end-of-life care.",
                "Choose a healthcare proxy to make decisions if you're unable to.",
                "Discuss your wishes with your family and doctors.",
                "Keep your directive easily accessible and provide copies to relevant parties."
            ]
        case "Beneficiary Designations":
            return [
                "Review and update beneficiaries on all accounts regularly.",
                "Ensure designations align with your overall estate plan.",
                "Consider contingent beneficiaries.",
                "Be aware that beneficiary designations typically override will provisions."
            ]
        case "Estate Planning Documents":
            return [
                "Keep all documents in a secure, easily accessible location.",
                "Inform your executor or trusted family member of document locations.",
                "Review and update documents every 3-5 years or after major life changes.",
                "Consider digital assets in your estate planning."
            ]
        default:
            return ["No specific tips available for this section."]
        }
    }
}

struct TipBox: View {
    let tip: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "lightbulb.fill")
                .foregroundColor(.yellow)
                .font(.system(size: 20))
            Text(tip)
                .font(.system(size: 14, weight: .regular, design: .rounded))
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(10)
    }
}

struct TemplatesView: View {
    let title: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            ForEach(getTemplates(), id: \.self) { template in
                HStack {
                    Image(systemName: "doc.fill")
                        .foregroundColor(.blue)
                        .font(.system(size: 20))
                    Text(template)
                        .font(.system(size: 16, weight: .medium, design: .rounded))
                    Spacer()
                    Button(action: {
                        // Action to download or view template
                    }) {
                        Image(systemName: "arrow.down.circle.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 24))
                    }
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
            }
        }
    }
    
    private func getTemplates() -> [String] {
        switch title {
        case "Will and Testament":
            return ["Simple Will Template", "Complex Will Template", "Living Will Template"]
        case "Power of Attorney":
            return ["General Power of Attorney", "Limited Power of Attorney", "Healthcare Power of Attorney"]
        case "Living Trust":
            return ["Revocable Living Trust", "Irrevocable Living Trust", "Asset Schedule for Trust"]
        case "Healthcare Directive":
            return ["Advance Healthcare Directive", "Do Not Resuscitate (DNR) Order", "HIPAA Authorization Form"]
        case "Beneficiary Designations":
            return ["Beneficiary Designation Form", "Contingent Beneficiary Form", "Transfer on Death (TOD) Agreement"]
        case "Estate Planning Documents":
            return ["Estate Planning Checklist", "Letter of Intent", "Digital Asset Inventory"]
        default:
            return ["No specific templates available for this section."]
        }
    }
}

struct DocumentListView: View {
    let documents: FetchedResults<LegalDocument>
    @Binding var isShowingDocumentPicker: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(documents) { document in
                LegalDocumentRow(document: document)
            }
            
            if documents.isEmpty {
                Text("No documents uploaded yet.")
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .foregroundColor(.secondary)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
            }
        }
    }
}

struct LegalDocumentRow: View {
    let document: LegalDocument
    
    var body: some View {
        HStack {
            Image(systemName: "doc.fill")
                .foregroundColor(.blue)
                .font(.system(size: 20))
            VStack(alignment: .leading) {
                Text(document.name ?? "Unnamed Document")
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                if let date = document.dateUploaded {
                    Text(date, style: .date)
                        .font(.system(size: 14, weight: .regular, design: .rounded))
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(10)
    }
}

struct DocumentPicker: UIViewControllerRepresentable {
    let subsection: String
    @Environment(\.presentationMode) var presentationMode
    @Environment(\.managedObjectContext) var viewContext
    
    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: [UTType.pdf, UTType.plainText], asCopy: true)
        picker.allowsMultipleSelection = false
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIDocumentPickerDelegate {
        let parent: DocumentPicker
        
        init(_ parent: DocumentPicker) {
            self.parent = parent
        }
        
        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            guard let url = urls.first else { return }
            
            let newDocument = LegalDocument(context: parent.viewContext)
            newDocument.id = UUID()
            newDocument.name = url.lastPathComponent
            newDocument.fileURL = url
            newDocument.dateUploaded = Date()
            newDocument.section = parent.subsection
            
            do {
                try parent.viewContext.save()
            } catch {
                print("Error saving document: \(error)")
            }
            
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

struct LegalSubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
}

struct LegalSubsectionCard: View {
    let subsection: LegalSubsection
    
    var body: some View {
        VStack {
            Image(systemName: subsection.icon)
                .font(.system(size: 30))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(Color.blue)
                .clipShape(Circle())
            
            Text(subsection.title)
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .multilineTextAlignment(.center)
                .foregroundColor(.primary)
        }
        .frame(height: 120)
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
        .shadow(radius: 5)
    }
}
