import SwiftUI

enum AppSection: String, CaseIterable, Identifiable {
    case legal = "Legal Matters"
    case finances = "Finances & Assets"
    case healthcare = "Healthcare"
    case personal = "Personal Legacy"
    case digital = "Digital Affairs"
    case support = "Support Network"
    case documents = "Document Vault"
    case messages = "Legacy Messages"
    case funeral = "Funeral Planning"
    case education = "Resources & Templates"

    var id: String { self.rawValue }
    
    var title: String { self.rawValue }
    
    var imageName: String {
        switch self {
        case .legal: return "scale.3d"
        case .finances: return "banknote"
        case .healthcare: return "heart.text.square"
        case .personal: return "person.fill.viewfinder"
        case .digital: return "keyboard"
        case .support: return "person.3.fill"
        case .documents: return "doc.on.doc.fill"
        case .messages: return "message.fill"
        case .funeral: return "leaf.fill"
        case .education: return "book.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .legal: return .blue
        case .finances: return .green
        case .healthcare: return .red
        case .personal: return .purple
        case .digital: return .orange
        case .support: return .pink
        case .documents: return .gray
        case .messages: return .cyan
        case .funeral: return .brown
        case .education: return .indigo
        }
    }
}

struct HomePage: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    welcomeSection
                    
                    quoteSection
                    
                    LazyVGrid(columns: columns, spacing: 20) {
                        ForEach(AppSection.allCases) { section in
                            NavigationLink(destination: getDetailView(for: section)) {
                                SectionCardView(section: section)
                            }
                        }
                    }
                    .padding(.horizontal)
                    
                    recentActivitySection
                    
                    resourcesSection
                }
                .padding(.vertical)
            }
            .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
            .navigationTitle("Your Legacy Journey")
        }
    }

    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Welcome, Rechelle")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Your journey to peace of mind starts here.")
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

    private var quoteSection: some View {
        Text("\"The meaning of life is to find your gift. The purpose of life is to give it away.\" - Pablo Picasso")
            .font(.system(size: 16, weight: .regular, design: .rounded).italic())
            .multilineTextAlignment(.center)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color(.systemGray6))
            .cornerRadius(15)
            .padding(.horizontal)
    }

    private var recentActivitySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Recent Updates")
                .font(.headline)
                .padding(.horizontal)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 15) {
                    ForEach(0..<3) { _ in
                        RecentActivityItemView(
                            icon: "doc.text",
                            title: "Will Updated",
                            date: "2 days ago"
                        )
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    private var resourcesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Helpful Resources")
                .font(.headline)
                .padding(.horizontal)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 15) {
                    ResourceItemView(title: "Estate Planning Guide", icon: "book.fill")
                    ResourceItemView(title: "Legal Aid Services", icon: "building.columns.fill")
                    ResourceItemView(title: "Grief Support Groups", icon: "heart.fill")
                }
                .padding(.horizontal)
            }
        }
    }

    @ViewBuilder
    private func getDetailView(for section: AppSection) -> some View {
        switch section {
        case .legal:
            LegalMattersView()
        case .finances:
            FinancesAssetsView()
        case .healthcare:
            HealthcareWishesView()
        case .personal:
            PersonalLegacyView()
        case .digital:
            DigitalAffairsView()
        case .support:
            SupportNetworkView()
        case .documents:
            DocumentVaultView()
        case .messages:
            LegacyMessagesView()
        case .funeral:
            FuneralPlanningView()
        case .education:
            ResourcesTemplatesView()
        }
    }
}

struct SectionCardView: View {
    let section: AppSection
    
    var body: some View {
        VStack {
            Image(systemName: section.imageName)
                .font(.system(size: 30))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(section.color)
                .clipShape(Circle())
            
            Text(section.title)
                .font(.system(size: 14, weight: .medium, design: .rounded))
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

struct RecentActivityItemView: View {
    let icon: String
    let title: String
    let date: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.accentColor)
                Text(title)
                    .font(.system(size: 14, weight: .medium, design: .rounded))
            }
            Text(date)
                .font(.system(size: 12, weight: .regular, design: .rounded))
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(width: 150)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(10)
        .shadow(radius: 3)
    }
}

struct ResourceItemView: View {
    let title: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 30))
                .foregroundColor(.accentColor)
            Text(title)
                .font(.system(size: 14, weight: .medium, design: .rounded))
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(width: 120, height: 120)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(10)
        .shadow(radius: 3)
    }
}

struct HomePage_Previews: PreviewProvider {
    static var previews: some View {
        HomePage()
    }
}
