//
//  SignUpView.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//

import SwiftUI
import CoreData

struct SignUpView: View {
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var password = ""
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.presentationMode) var presentationMode

    var body: some View {
        NavigationView {
            Form {
                Section(rawValue: <#String#>, header: Text("Personal Information")) {
                    TextField("First Name", text: $firstName)
                    TextField("Last Name", text: $lastName)
                }
                
                Section(header: Text("Account Information")) {
                    TextField("Email", text: $email)
                    SecureField("Password", text: $password)
                }
                
                Section {
                    Button("Sign Up") {
                        signUp()
                    }
                }
            }
            .navigationTitle("Sign Up")
        }
    }
    
    private func signUp() {
        let newUser = User(context: viewContext)
        newUser.id = UUID()
        newUser.first_name = firstName
        newUser.last_name = lastName
        newUser.email = email
        newUser.password = password
        
        do {
            try viewContext.save()
            presentationMode.wrappedValue.dismiss()
        } catch {
            print("Error saving user: \(error)")
        }
    }
}

struct SignUpView_Previews: PreviewProvider {
    static var previews: some View {
        SignUpView().environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
    }
}
