//
//  HealthcareWishesView.swift
//  iDecide
//
//  Created by hamish leahy on 17/8/2024.
//

import Foundation
import SwiftUI

struct HealthcareWishesView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    let subsections = [
        HealthcareSubsection(title: "Advance Directive", icon: "doc.text"),
        HealthcareSubsection(title: "Healthcare Proxy", icon: "person.fill"),
        HealthcareSubsection(title: "Living Will", icon: "text.book.closed"),
        HealthcareSubsection(title: "DNR Order", icon: "xmark.circle"),
        HealthcareSubsection(title: "Palliative Care", icon: "leaf.fill"),
        HealthcareSubsection(title: "Organ Donation", icon: "heart.fill")
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                welcomeSection
                
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(subsections) { subsection in
                        NavigationLink(destination: HealthcareSubsectionView(title: subsection.title)) {
                            HealthcareSubsectionCard(subsection: subsection)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Healthcare Wishes")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Healthcare Wishes")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Document your healthcare preferences")
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

struct HealthcareSubsectionView: View {
    let title: String
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HealthcareSectionDivider(title: "Tips")
                HealthcareTipsView(title: title)
                
                HealthcareSectionDivider(title: "Templates")
                HealthcareTemplatesView(title: title)
                
                HealthcareSectionDivider(title: "Documents")
                HealthcareDocumentListView(documents: [])
            }
            .padding()
        }
        .navigationTitle(title)
    }
}

struct HealthcareTipsView: View {
    let title: String
    
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 15) {
            ForEach(getTips(for: title), id: \.self) { tip in
                HealthcareTipBox(tip: tip)
            }
        }
    }
    
    func getTips(for title: String) -> [String] {
        switch title {
        case "Advance Directive":
            return [
                "Discuss your wishes with loved ones and healthcare providers.",
                "Consider including specific instructions for various medical situations.",
                "Review and update your directive periodically."
            ]
        case "Healthcare Proxy":
            return [
                "Choose someone you trust to make medical decisions on your behalf.",
                "Discuss your healthcare wishes with your chosen proxy.",
                "Provide copies of the proxy designation to your doctors and loved ones."
            ]
        case "Living Will":
            return [
                "Be specific about the types of medical treatments you do or do not want.",
                "Consider situations like terminal illness, persistent vegetative state, etc.",
                "Ensure your living will aligns with your advance directive and healthcare proxy."
            ]
        case "DNR Order":
            return [
                "Discuss the implications of a DNR order with your doctor.",
                "Make sure your family and healthcare providers are aware of your DNR status.",
                "Consider wearing a medical ID bracelet indicating your DNR status."
            ]
        case "Palliative Care":
            return [
                "Understand the difference between palliative care and hospice care.",
                "Discuss pain management and comfort care options with your healthcare team.",
                "Consider incorporating palliative care early in the course of a serious illness."
            ]
        case "Organ Donation":
            return [
                "Make your organ donation wishes known to your family and healthcare providers.",
                "Register as an organ donor with your state's donor registry.",
                "Consider including organ donation instructions in your advance directive."
            ]
        default:
            return []
        }
    }
}

struct HealthcareTipBox: View {
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

struct HealthcareTemplatesView: View {
    let title: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            ForEach(getTemplates(for: title), id: \.self) { template in
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
    
    func getTemplates(for title: String) -> [String] {
        switch title {
        case "Advance Directive":
            return [
                "Advance Directive Form",
                "Living Will Template",
                "Healthcare Power of Attorney"
            ]
        case "Healthcare Proxy":
            return [
                "Healthcare Proxy Designation Form",
                "Durable Power of Attorney for Healthcare"
            ]
        case "Living Will":
            return [
                "Living Will Declaration",
                "End-of-Life Wishes Statement"
            ]
        case "DNR Order":
            return [
                "Do Not Resuscitate (DNR) Order Form",
                "Physician Orders for Life-Sustaining Treatment (POLST) Form"
            ]
        case "Palliative Care":
            return [
                "Palliative Care Treatment Plan",
                "Pain Management Preferences"
            ]
        case "Organ Donation":
            return [
                "Organ Donor Designation Form",
                "Anatomical Gift Declaration"
            ]
        default:
            return []
        }
    }
}

struct HealthcareDocumentListView: View {
    let documents: [String]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if documents.isEmpty {
                Text("No documents uploaded yet.")
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .foregroundColor(.secondary)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
            } else {
                ForEach(documents, id: \.self) { document in
                    HStack {
                        Image(systemName: "doc.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 20))
                        Text(document)
                            .font(.system(size: 16, weight: .medium, design: .rounded))
                    }
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
                }
            }
        }
    }
}

struct HealthcareSectionDivider: View {
    let title: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
            
            Divider()
                .background(Color.red.opacity(0.5))
                .frame(height: 2)
        }
        .padding(.top, 10)
    }
}

struct HealthcareSubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
}

struct HealthcareSubsectionCard: View {
    let subsection: HealthcareSubsection
    
    var body: some View {
        VStack {
            Image(systemName: subsection.icon)
                .font(.system(size: 30))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(Color.red)
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
