//
//  SupportNetworkView.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//

import SwiftUI

struct SupportNetworkView: View {
    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var preferredContactMethod = "Email"
    @State private var counselingReason = ""
    @State private var preferredCounselorGender = "No Preference"
    @State private var isSubmitted = false
    
    let contactMethods = ["Email", "Phone", "Text"]
    let counselorGenders = ["No Preference", "Male", "Female", "Non-binary"]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerSection
                AnytimeCounselingForm
                otherServicesSection
            }
            .padding()
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Support Network")
        .alert(isPresented: $isSubmitted) {
            Alert(title: Text("Form Submitted"),
                  message: Text("Thank you for your interest in AnytimeCounseling. A counselor will contact you shortly."),
                  dismissButton: .default(Text("OK")))
        }
    }
    
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Connect with your support system and get help when you need it")
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
        .shadow(radius: 5)
    }
    
    private var AnytimeCounselingForm: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("AnytimeCounseling Request Form")
                .font(.headline)
            
            TextField("Name", text: $name)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            TextField("Email", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.emailAddress)
            
            TextField("Phone", text: $phone)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.phonePad)
            
            Picker("Preferred Contact Method", selection: $preferredContactMethod) {
                ForEach(contactMethods, id: \.self) {
                    Text($0)
                }
            }
            .pickerStyle(SegmentedPickerStyle())
            
            TextField("Reason for Counseling", text: $counselingReason)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            Picker("Preferred Counselor Gender", selection: $preferredCounselorGender) {
                ForEach(counselorGenders, id: \.self) {
                    Text($0)
                }
            }
            .pickerStyle(MenuPickerStyle())
            
            Button(action: submitForm) {
                Text("Submit Request")
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(10)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
    }
    
    private var otherServicesSection: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Other Support Services")
                .font(.headline)
                .padding(.bottom, 5)
            
            ForEach(supportServices, id: \.name) { service in
                SupportServiceRow(service: service)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
    }
    
    private func submitForm() {
        // Here you would typically send this information to your backend or AnytimeCounseling's API
        print("Form submitted with: Name: \(name), Email: \(email), Phone: \(phone), Preferred Contact: \(preferredContactMethod), Reason: \(counselingReason), Preferred Counselor Gender: \(preferredCounselorGender)")
        isSubmitted = true
        
        // Clear the form
        name = ""
        email = ""
        phone = ""
        preferredContactMethod = "Email"
        counselingReason = ""
        preferredCounselorGender = "No Preference"
    }
}

struct SupportService {
    let name: String
    let description: String
    let icon: String
}

struct SupportServiceRow: View {
    let service: SupportService
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: service.icon)
                .foregroundColor(.blue)
                .font(.system(size: 24))
                .frame(width: 30, height: 30)
            
            VStack(alignment: .leading, spacing: 5) {
                Text(service.name)
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                Text(service.description)
                    .font(.system(size: 14, weight: .regular, design: .rounded))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .cornerRadius(10)
    }
}

let supportServices = [
    SupportService(name: "24/7 Crisis Hotline", description: "Immediate support for emotional crises", icon: "phone.fill"),
    SupportService(name: "Grief Support Group", description: "Weekly meetings for those dealing with loss", icon: "person.3.fill"),
    SupportService(name: "Financial Counseling", description: "Guidance on managing estate and finances", icon: "dollarsign.circle.fill"),
    SupportService(name: "Legal Aid", description: "Free legal advice for estate planning", icon: "book.fill")
]

struct SupportNetworkView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            SupportNetworkView()
        }
    }
}
