//
//  DigitalAffairsView.swift
//  iDecide
//
//  Created by hamish leahy on 18/8/2024.
//

import Foundation
import SwiftUI

struct DigitalAffairsView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    let subsections = [
        DigitalSubsection(title: "Social Media", icon: "network", color: .blue),
        DigitalSubsection(title: "Email Accounts", icon: "envelope.fill", color: .red),
        DigitalSubsection(title: "Passwords", icon: "lock.fill", color: .green),
        DigitalSubsection(title: "Devices", icon: "desktopcomputer", color: .purple)
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                welcomeSection
                
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(subsections) { subsection in
                        NavigationLink(destination: getDetailView(for: subsection.title)) {
                            DigitalSubsectionCard(subsection: subsection)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Digital Affairs")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Digital Affairs")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Manage your digital legacy")
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
    
    @ViewBuilder
    private func getDetailView(for title: String) -> some View {
        switch title {
        case "Social Media":
            SocialMediaView()
        case "Email Accounts":
            EmailAccountsView()
        case "Passwords":
            PasswordsView()
        case "Devices":
            DevicesView()
        default:
            Text("Coming Soon")
        }
    }
}

struct SocialMediaView: View {
    @State private var accounts: [SocialMediaAccount] = []
    @State private var showingAddAccount = false
    
    var body: some View {
        List {
            ForEach(accounts) { account in
                VStack(alignment: .leading) {
                    Text(account.platform)
                        .font(.headline)
                    Text(account.username)
                        .font(.subheadline)
                }
            }
            .onDelete(perform: deleteAccount)
        }
        .navigationTitle("Social Media Accounts")
        .toolbar {
            Button(action: { showingAddAccount = true }) {
                Image(systemName: "plus")
            }
        }
        .sheet(isPresented: $showingAddAccount) {
            AddSocialMediaAccountView(accounts: $accounts)
        }
    }
    
    func deleteAccount(at offsets: IndexSet) {
        accounts.remove(atOffsets: offsets)
    }
}

struct EmailAccountsView: View {
    @State private var accounts: [EmailAccount] = []
    @State private var showingAddAccount = false
    
    var body: some View {
        List {
            ForEach(accounts) { account in
                VStack(alignment: .leading) {
                    Text(account.email)
                        .font(.headline)
                    Text(account.provider)
                        .font(.subheadline)
                }
            }
            .onDelete(perform: deleteAccount)
        }
        .navigationTitle("Email Accounts")
        .toolbar {
            Button(action: { showingAddAccount = true }) {
                Image(systemName: "plus")
            }
        }
        .sheet(isPresented: $showingAddAccount) {
            AddEmailAccountView(accounts: $accounts)
        }
    }
    
    func deleteAccount(at offsets: IndexSet) {
        accounts.remove(atOffsets: offsets)
    }
}

struct PasswordsView: View {
    @State private var passwords: [Password] = []
    @State private var showingAddPassword = false
    
    var body: some View {
        List {
            ForEach(passwords) { password in
                VStack(alignment: .leading) {
                    Text(password.service)
                        .font(.headline)
                    Text(password.username)
                        .font(.subheadline)
                }
            }
            .onDelete(perform: deletePassword)
        }
        .navigationTitle("Passwords")
        .toolbar {
            Button(action: { showingAddPassword = true }) {
                Image(systemName: "plus")
            }
        }
        .sheet(isPresented: $showingAddPassword) {
            AddPasswordView(passwords: $passwords)
        }
    }
    
    func deletePassword(at offsets: IndexSet) {
        passwords.remove(atOffsets: offsets)
    }
}

struct DevicesView: View {
    @State private var devices: [Device] = []
    @State private var showingAddDevice = false
    
    var body: some View {
        List {
            ForEach(devices) { device in
                VStack(alignment: .leading) {
                    Text(device.name)
                        .font(.headline)
                    Text(device.type)
                        .font(.subheadline)
                }
            }
            .onDelete(perform: deleteDevice)
        }
        .navigationTitle("Devices")
        .toolbar {
            Button(action: { showingAddDevice = true }) {
                Image(systemName: "plus")
            }
        }
        .sheet(isPresented: $showingAddDevice) {
            AddDeviceView(devices: $devices)
        }
    }
    
    func deleteDevice(at offsets: IndexSet) {
        devices.remove(atOffsets: offsets)
    }
}

struct AddSocialMediaAccountView: View {
    @Binding var accounts: [SocialMediaAccount]
    @State private var platform = ""
    @State private var username = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Platform", text: $platform)
                TextField("Username", text: $username)
                Button("Save") {
                    let newAccount = SocialMediaAccount(platform: platform, username: username)
                    accounts.append(newAccount)
                    presentationMode.wrappedValue.dismiss()
                }
            }
            .navigationTitle("Add Social Media Account")
        }
    }
}

struct AddEmailAccountView: View {
    @Binding var accounts: [EmailAccount]
    @State private var email = ""
    @State private var provider = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Email", text: $email)
                TextField("Provider", text: $provider)
                Button("Save") {
                    let newAccount = EmailAccount(email: email, provider: provider)
                    accounts.append(newAccount)
                    presentationMode.wrappedValue.dismiss()
                }
            }
            .navigationTitle("Add Email Account")
        }
    }
}

struct AddPasswordView: View {
    @Binding var passwords: [Password]
    @State private var service = ""
    @State private var username = ""
    @State private var password = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Service", text: $service)
                TextField("Username", text: $username)
                SecureField("Password", text: $password)
                Button("Save") {
                    let newPassword = Password(service: service, username: username, password: password)
                    passwords.append(newPassword)
                    presentationMode.wrappedValue.dismiss()
                }
            }
            .navigationTitle("Add Password")
        }
    }
}

struct AddDeviceView: View {
    @Binding var devices: [Device]
    @State private var name = ""
    @State private var type = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Device Name", text: $name)
                TextField("Device Type", text: $type)
                Button("Save") {
                    let newDevice = Device(name: name, type: type)
                    devices.append(newDevice)
                    presentationMode.wrappedValue.dismiss()
                }
            }
            .navigationTitle("Add Device")
        }
    }
}

struct DigitalSubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let color: Color
}

struct DigitalSubsectionCard: View {
    let subsection: DigitalSubsection
    
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

struct SocialMediaAccount: Identifiable {
    let id = UUID()
    let platform: String
    let username: String
}

struct EmailAccount: Identifiable {
    let id = UUID()
    let email: String
    let provider: String
}

struct Password: Identifiable {
    let id = UUID()
    let service: String
    let username: String
    let password: String
}

struct Device: Identifiable {
    let id = UUID()
    let name: String
    let type: String
}
