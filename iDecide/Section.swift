//
//  Section.swift
//  iDecide
//
//  Created by hamish leahy on 17/8/2024.
//
import SwiftUI

enum Section: String, CaseIterable, Identifiable {
    case legal = "Legal Matters"
    case finances = "Finances & Assets"
    case healthcare = "Healthcare Wishes"
    case personal = "Personal Legacy"
    case digital = "Digital Affairs"
    case support = "Support Network"
    case documents = "Document Vault"
    case messages = "Legacy Messages"
    case funeral = "Funeral Planning"
    case education = "Resources & Education"

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
