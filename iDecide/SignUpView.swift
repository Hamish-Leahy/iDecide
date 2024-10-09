//
//  SignUpView.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//
import SwiftUI
import CoreData
import CryptoKit

struct SignUpView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showPassword = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var navigateToHome = false
    
    var body: some View {
        NavigationView {
            Form {
                SwiftUI.Section(header: Text("Personal Information")) {
                    TextField("First Name", text: $firstName)
                    TextField("Last Name", text: $lastName)
                }
                
                SwiftUI.Section(header: Text("Account Information")) {
                    TextField("Email", text: $email)
                        .autocapitalization(.none)
                        .keyboardType(.emailAddress)
                    HStack {
                        if showPassword {
                            TextField("Password", text: $password)
                        } else {
                            SecureField("Password", text: $password)
                        }
                        Button(action: { showPassword.toggle() }) {
                            Image(systemName: showPassword ? "eye.slash" : "eye")
                        }
                    }
                    SecureField("Confirm Password", text: $confirmPassword)
                }
                
                SwiftUI.Section {
                    Button(action: signUp) {
                        Text("Sign Up")
                            .frame(maxWidth: .infinity)
                    }
                    .disabled(!isFormValid)
                }
            }
            .navigationTitle("Sign Up")
            .alert(isPresented: $showingAlert) {
                Alert(title: Text("Sign Up Error"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
            }
            .background(
                NavigationLink(destination: HomePage(), isActive: $navigateToHome) {
                    EmptyView()
                }
            )
        }
    }
    
    private var isFormValid: Bool {
        !firstName.isEmpty && !lastName.isEmpty && !email.isEmpty &&
        !password.isEmpty && password == confirmPassword &&
        password.count >= 8 && email.contains("@")
    }
    
    private func signUp() {
        guard isFormValid else {
            alertMessage = "Please ensure all fields are filled correctly."
            showingAlert = true
            return
        }
        
        let newUser = User(context: viewContext)
        newUser.id = UUID()
        newUser.first_name = firstName
        newUser.last_name = lastName
        newUser.email = email
        newUser.password = hashPassword(password)
        
        do {
            try viewContext.save()
            navigateToHome = true
        } catch {
            alertMessage = "Error saving user: \(error.localizedDescription)"
            showingAlert = true
        }
    }
    
    private func hashPassword(_ password: String) -> String {
        let inputData = Data(password.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }
}

struct SignUpView_Previews: PreviewProvider {
    static var previews: some View {
        SignUpView().environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
    }
}
