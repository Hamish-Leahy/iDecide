//
//  LoginView.swfit.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//

import Foundation
import SwiftUI
import CoreData

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var showingSignUp = false
    @State private var showingHomePage = false
    @Environment(\.managedObjectContext) private var viewContext

    var body: some View {
        NavigationView {
            VStack {
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                
                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                
                Button("Log In") {
                    login()
                }
                .padding()
                
                Button("Sign Up") {
                    showingSignUp = true
                }
                .padding()
            }
            .navigationTitle("iDecide")
            .sheet(isPresented: $showingSignUp) {
                SignUpView()
            }
            .fullScreenCover(isPresented: $showingHomePage) {
                HomePage()
            }
        }
    }
    
    private func login() {
        let fetchRequest: NSFetchRequest<User> = User.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "email == %@ AND password == %@", email, password)
        
        do {
            let results = try viewContext.fetch(fetchRequest)
            if let _ = results.first {
                showingHomePage = true
            } else {
                // Show error message
            }
        } catch {
            print("Error fetching user: \(error)")
        }
    }
}
