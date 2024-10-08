//
//  PersonalLegacyView.swift
//  iDecide
//
//  Created by hamish leahy on 17/8/2024.
//

import SwiftUI
import CoreData

struct PersonalLegacyView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    let subsections = [
        PersonalLegacySubsection(title: "Life Story", icon: "book.fill", color: .blue),
        PersonalLegacySubsection(title: "Favorite Memories", icon: "photo.fill", color: .green),
        PersonalLegacySubsection(title: "Personal Values", icon: "heart.fill", color: .red),
        PersonalLegacySubsection(title: "Legacy Letters", icon: "envelope.fill", color: .orange),
        PersonalLegacySubsection(title: "Genealogy", icon: "person.3.fill", color: .purple),
        PersonalLegacySubsection(title: "Legacy Videos", icon: "video.fill", color: .pink)
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                welcomeSection
                
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(subsections) { subsection in
                        NavigationLink(destination: PersonalLegacySubsectionView(title: subsection.title)) {
                            PersonalLegacySubsectionCard(subsection: subsection)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Personal Legacy")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var welcomeSection: some View {
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

struct PersonalLegacySubsectionView: View {
    let title: String
    @State private var content: String = ""
    @State private var isShowingDocumentPicker = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                PersonalLegacySectionDivider(title: "Description")
                Text(getDescription(for: title))
                    .font(.system(size: 16, weight: .regular, design: .rounded))
                
                PersonalLegacySectionDivider(title: "Your \(title)")
                TextEditor(text: $content)
                    .frame(height: 200)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
                
                if title == "Legacy Letters" {
                    PersonalLegacySectionDivider(title: "Recipients")
                    PeopleListView()
                } else if title == "Legacy Videos" {
                    PersonalLegacySectionDivider(title: "Videos")
                    VideoListView()
                }
                
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
            .padding()
        }
        .navigationTitle(title)
    }
    
    func getDescription(for title: String) -> String {
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

struct PeopleListView: View {
    @State private var people: [String] = ["John Doe", "Jane Smith", "David Johnson"]
    @State private var newPerson: String = ""
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(people, id: \.self) { person in
                Text(person)
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
            }
            
            HStack {
                TextField("Add new person", text: $newPerson)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Button(action: {
                    if !newPerson.isEmpty {
                        people.append(newPerson)
                        newPerson = ""
                    }
                }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.blue)
                }
            }
        }
    }
}

struct VideoListView: View {
    @State private var videos: [String] = ["My Childhood", "Wedding Day", "Family Vacation"]
    @State private var newVideo: String = ""
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(videos, id: \.self) { video in
                Text(video)
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
            }
            
            HStack {
                TextField("Add new video", text: $newVideo)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Button(action: {
                    if !newVideo.isEmpty {
                        videos.append(newVideo)
                        newVideo = ""
                    }
                }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.blue)
                }
            }
        }
    }
}

struct PersonalLegacySectionDivider: View {
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

struct PersonalLegacySubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let color: Color
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
