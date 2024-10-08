//
//  FuneralPlanningView.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//

import Foundation
import SwiftUI

struct FuneralPlanningView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    let subsections = [
        FuneralSubsection(title: "Ceremony Preferences", icon: "building.columns"),
        FuneralSubsection(title: "Burial or Cremation", icon: "leaf.fill"),
        FuneralSubsection(title: "Obituary", icon: "newspaper"),
        FuneralSubsection(title: "Final Arrangements", icon: "list.bullet.clipboard")
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                welcomeSection
                
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(subsections) { subsection in
                        NavigationLink(destination: FuneralSubsectionView(title: subsection.title)) {
                            FuneralSubsectionCard(subsection: subsection)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Funeral Planning")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Funeral Planning")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Plan your final arrangements")
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

struct FuneralSubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
}

struct FuneralSubsectionCard: View {
    let subsection: FuneralSubsection
    
    var body: some View {
        VStack {
            Image(systemName: subsection.icon)
                .font(.system(size: 30))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(Color.brown)
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

struct FuneralSubsectionView: View {
    let title: String
    
    var body: some View {
        Text("Details for \(title)")
            .navigationTitle(title)
    }
}

struct FuneralPlanningView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            FuneralPlanningView()
        }
    }
}
