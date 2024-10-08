//
//  ResourceTemplatesView.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//

import Foundation
import SwiftUI

struct ResourcesTemplatesView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    let subsections = [
        ResourceSubsection(title: "Educational Resources", icon: "book.fill"),
        ResourceSubsection(title: "Legal Templates", icon: "doc.text.fill"),
        ResourceSubsection(title: "Financial Guides", icon: "chart.pie.fill"),
        ResourceSubsection(title: "Healthcare Information", icon: "heart.text.square.fill")
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                welcomeSection
                
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(subsections) { subsection in
                        NavigationLink(destination: ResourceSubsectionView(title: subsection.title)) {
                            ResourceSubsectionCard(subsection: subsection)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Resources & Templates")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Resources & Templates")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Access helpful information and documents")
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

struct ResourceSubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
}

struct ResourceSubsectionCard: View {
    let subsection: ResourceSubsection
    
    var body: some View {
        VStack {
            Image(systemName: subsection.icon)
                .font(.system(size: 30))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(Color.indigo)
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

struct ResourceSubsectionView: View {
    let title: String
    
    var body: some View {
        Text("Details for \(title)")
            .navigationTitle(title)
    }
}

struct ResourcesTemplatesView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            ResourcesTemplatesView()
        }
    }
}
