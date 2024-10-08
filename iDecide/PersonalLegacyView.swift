import SwiftUI
import CoreData

struct PersonalLegacyView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    private let subsections = PersonalLegacySubsection.allSubsections
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                WelcomeSection()
                SubsectionsGrid(subsections: subsections)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Personal Legacy")
        .navigationBarTitleDisplayMode(.large)
    }
}

struct WelcomeSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Personal Legacy")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Preserve your memories and values")
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

struct SubsectionsGrid: View {
    let subsections: [PersonalLegacySubsection]
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    var body: some View {
        LazyVGrid(columns: columns, spacing: 20) {
            ForEach(subsections) { subsection in
                NavigationLink(destination: PersonalLegacySubsectionView(title: subsection.title)) {
                    PersonalLegacySubsectionCard(subsection: subsection)
                }
            }
        }
        .padding(.horizontal)
    }
}

struct PersonalLegacySubsectionView: View {
    let title: String
    @State private var content: String = ""
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionDivider(title: "Description")
                Text(PersonalLegacyContent.getDescription(for: title))
                    .font(.system(size: 16, weight: .regular, design: .rounded))
                
                SectionDivider(title: "Your \(title)")
                TextEditor(text: $content)
                    .frame(height: 200)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
                
                if title == "Legacy Letters" {
                    SectionDivider(title: "Recipients")
                    PeopleListView()
                } else if title == "Legacy Videos" {
                    SectionDivider(title: "Videos")
                    VideoListView()
                }
                
                SaveButton()
            }
            .padding()
        }
        .navigationTitle(title)
    }
}

struct PeopleListView: View {
    @State private var people: [String] = ["John Doe", "Jane Smith", "David Johnson"]
    @State private var newPerson: String = ""
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(people, id: \.self) { person in
                PersonRow(name: person)
            }
            
            AddPersonRow(newPerson: $newPerson, people: $people)
        }
    }
}

struct PersonRow: View {
    let name: String
    
    var body: some View {
        Text(name)
            .font(.system(size: 16, weight: .medium, design: .rounded))
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.secondarySystemBackground))
            .cornerRadius(10)
    }
}

struct AddPersonRow: View {
    @Binding var newPerson: String
    @Binding var people: [String]
    
    var body: some View {
        HStack {
            TextField("Add new person", text: $newPerson)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            Button(action: addPerson) {
                Image(systemName: "plus.circle.fill")
                    .foregroundColor(.blue)
            }
        }
    }
    
    private func addPerson() {
        if !newPerson.isEmpty {
            people.append(newPerson)
            newPerson = ""
        }
    }
}

struct VideoListView: View {
    @State private var videos: [String] = ["My Childhood", "Wedding Day", "Family Vacation"]
    @State private var newVideo: String = ""
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(videos, id: \.self) { video in
                VideoRow(title: video)
            }
            
            AddVideoRow(newVideo: $newVideo, videos: $videos)
        }
    }
}

struct VideoRow: View {
    let title: String
    
    var body: some View {
        Text(title)
            .font(.system(size: 16, weight: .medium, design: .rounded))
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.secondarySystemBackground))
            .cornerRadius(10)
    }
}

struct AddVideoRow: View {
    @Binding var newVideo: String
    @Binding var videos: [String]
    
    var body: some View {
        HStack {
            TextField("Add new video", text: $newVideo)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            Button(action: addVideo) {
                Image(systemName: "plus.circle.fill")
                    .foregroundColor(.blue)
            }
        }
    }
    
    private func addVideo() {
        if !newVideo.isEmpty {
            videos.append(newVideo)
            newVideo = ""
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
                .background(Color.purple.opacity(0.5))
                .frame(height: 2)
        }
        .padding(.top, 10)
    }
}

struct SaveButton: View {
    var body: some View {
        Button(action: {
            // Save content action
        }) {
            Text("Save")
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundColor(.white)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.blue)
                .cornerRadius(10)
        }
    }
}

struct PersonalLegacySubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let color: Color
    
    static let allSubsections = [
        PersonalLegacySubsection(title: "Life Story", icon: "book.fill", color: .blue),
        PersonalLegacySubsection(title: "Favorite Memories", icon: "photo.fill", color: .green),
        PersonalLegacySubsection(title: "Personal Values", icon: "heart.fill", color: .red),
        PersonalLegacySubsection(title: "Legacy Letters", icon: "envelope.fill", color: .orange),
        PersonalLegacySubsection(title: "Genealogy", icon: "person.3.fill", color: .purple),
        PersonalLegacySubsection(title: "Legacy Videos", icon: "video.fill", color: .pink)
    ]
}

struct PersonalLegacySubsectionCard: View {
    let subsection: PersonalLegacySubsection
    
    var body: some View {
        VStack {
            Image(systemName: subsection.icon)
                .font(.system(size: 30))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(subsection.color)
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

enum PersonalLegacyContent {
    static func getDescription(for title: String) -> String {
        switch title {
        case "Life Story":
            return "Write about the key events and milestones in your life. Share your personal journey, challenges overcome, and lessons learned."
        case "Favorite Memories":
            return "Describe your most cherished memories. What made them special? Who was involved? How did these moments shape you?"
        case "Personal Values":
            return "Reflect on the core values that guide your life. Explain why they're important to you and how they've influenced your decisions."
        case "Legacy Letters":
            return "Write heartfelt messages to your loved ones. Express your feelings, share wisdom, or offer guidance for the future."
        case "Genealogy":
            return "Document your family history. Include stories about your ancestors, family traditions, and your place in the family tree."
        case "Legacy Videos":
            return "Record videos sharing your life stories, wisdom, or messages for future generations."
        default:
            return ""
        }
    }
}
