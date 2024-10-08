import SwiftUI

struct SectionDetailView: View {
    let section: Section
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                headerView
                contentView
            }
            .padding()
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle(section.title)
    }
    
    private var headerView: some View {
        HStack {
            Image(systemName: section.imageName)
                .font(.system(size: 40))
                .foregroundColor(.white)
                .frame(width: 80, height: 80)
                .background(section.color)
                .clipShape(Circle())
            
            VStack(alignment: .leading) {
                Text(section.title)
                    .font(.title2)
                    .fontWeight(.bold)
                Text(sectionDescription)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
        .shadow(radius: 5)
    }
    
    private var contentView: some View {
        VStack(alignment: .leading, spacing: 15) {
            ForEach(sectionItems, id: \.self) { item in
                HStack {
                    Image(systemName: "checkmark.circle")
                        .foregroundColor(.accentColor)
                    Text(item)
                        .font(.body)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
        .shadow(radius: 5)
    }
    
    private var sectionDescription: String {
        switch section {
        case .legal:
            return "Ensure your wishes are legally protected"
        case .finances:
            return "Organize and plan your financial legacy"
        case .healthcare:
            return "Document your healthcare preferences"
        case .personal:
            return "Preserve your memories and values"
        case .digital:
            return "Manage your online presence and accounts"
        case .support:
            return "Connect with your support network"
        case .documents:
            return "Securely store important documents"
        case .messages:
            return "Create lasting messages for loved ones"
        case .funeral:
            return "Plan your final arrangements"
        case .education:
            return "Learn about end-of-life planning"
        }
    }
    
    private var sectionItems: [String] {
        switch section {
        case .legal:
            return ["Create or update your will", "Assign power of attorney", "Review estate planning documents"]
        case .finances:
            return ["List all assets and debts", "Set up beneficiaries", "Create a financial inventory"]
        case .healthcare:
            return ["Create an advance directive", "Assign a healthcare proxy", "Document end-of-life care preferences"]
        case .personal:
            return ["Write letters to loved ones", "Create a life story or memoir", "Plan a legacy project"]
        case .digital:
            return ["Inventory digital assets", "Set up a digital executor", "Plan for social media accounts"]
        case .support:
            return ["List important contacts", "Connect with support groups", "Plan for pet care"]
        case .documents:
            return ["Upload important documents", "Organize documents by category", "Set access permissions"]
        case .messages:
            return ["Record video messages", "Write letters for future events", "Create an ethical will"]
        case .funeral:
            return ["Choose between burial and cremation", "Plan a memorial service", "Write an obituary"]
        case .education:
            return ["Read articles on estate planning", "Watch video tutorials", "Attend webinars on end-of-life topics"]
        }
    }
}

struct SectionDetailView_Previews: PreviewProvider {
    static var previews: some View {
        SectionDetailView(section: .legal)
    }
}
