//
//  SupportNetworkView.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//

import Foundation
import SwiftUI

struct SupportNetworkView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    let subsections = [
        SupportSubsection(title: "Important Contacts", icon: "person.crop.circle"),
        SupportSubsection(title: "Support Groups", icon: "person.3.fill"),
        SupportSubsection(title: "Caregivers", icon: "heart.circle"),
        SupportSubsection(title: "Professional Help", icon: "briefcase")
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                welcomeSection
                
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(subsections) { subsection in
                        NavigationLink(destination: SupportSubsectionView(title: subsection.title)) {
                            SupportSubsectionCard(subsection: subsection)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Support Network")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Support Network")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Connect with your support system")
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

struct SupportSubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
}

struct SupportSubsectionCard: View {
    let subsection: SupportSubsection
    
    var body: some View {
        VStack {
            Image(systemName: subsection.icon)
                .font(.system(size: 30))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(Color.pink)
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

struct SupportSubsectionView: View {
    let title: String
    
    var body: some View {
        Text("Details for \(title)")
            .navigationTitle(title)
    }
}

struct SupportNetworkView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            SupportNetworkView()
        }
    }
}
