//
//  OnboardingView.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//

import Foundation
import SwiftUI

struct OnboardingView: View {
    @State private var currentPage = 0
    @Binding var hasCompletedOnboarding: Bool

    var body: some View {
        TabView(selection: $currentPage) {
            OnboardingPage(title: "Welcome to iDecide", description: "Plan your legacy with ease", imageName: "house.fill")
                .tag(0)
            OnboardingPage(title: "Organize Your Affairs", description: "Keep all your important information in one place", imageName: "folder.fill")
                .tag(1)
            OnboardingPage(title: "Share with Loved Ones", description: "Ensure your wishes are known and respected", imageName: "person.3.fill")
                .tag(2)
            OnboardingPage(title: "Get Started", description: "Begin your journey to peace of mind", imageName: "arrow.right.circle.fill", isLast: true) {
                hasCompletedOnboarding = true
            }
            .tag(3)
        }
        .tabViewStyle(PageTabViewStyle())
        .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
    }
}

struct OnboardingPage: View {
    let title: String
    let description: String
    let imageName: String
    var isLast = false
    var action: (() -> Void)?

    var body: some View {
        VStack {
            Image(systemName: imageName)
                .resizable()
                .scaledToFit()
                .frame(width: 100, height: 100)
                .foregroundColor(.blue)
                .padding()
            
            Text(title)
                .font(.title)
                .fontWeight(.bold)
                .padding()
            
            Text(description)
                .font(.body)
                .multilineTextAlignment(.center)
                .padding()
            
            if isLast {
                Button("Get Started") {
                    action?()
                }
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        }
    }
}
