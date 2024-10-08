//
//  FinanceAssetsView.swift
//  iDecide
//
//  Created by hamish leahy on 17/8/2024.
//

import Foundation
import SwiftUI
import CoreData

struct FinancesAssetsView: View {
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    let subsections = [
        FinanceSubsection(title: "Real Estate", icon: "house.fill"),
        FinanceSubsection(title: "Stock Portfolio", icon: "chart.line.uptrend.xyaxis"),
        FinanceSubsection(title: "Bank Accounts", icon: "banknote"),
        FinanceSubsection(title: "Retirement Accounts", icon: "dollarsign.circle"),
        FinanceSubsection(title: "Personal Property", icon: "car.fill"),
        FinanceSubsection(title: "Other Investments", icon: "briefcase.fill")
    ]
    
    @State private var totalAssetValue: Double = 2_500_000 // Example total value
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                welcomeSection
                
                totalValueSection
                
                beneficiaryDistributionSection
                
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(subsections) { subsection in
                        NavigationLink(destination: FinanceSubsectionView(title: subsection.title)) {
                            FinanceSubsectionCard(subsection: subsection)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemBackground).edgesIgnoringSafeArea(.all))
        .navigationTitle("Finances & Assets")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Finances & Assets")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("Organize and plan your financial legacy")
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
    
    private var totalValueSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Total Asset Value")
                .font(.system(size: 20, weight: .bold, design: .rounded))
            Text("$\(totalAssetValue, specifier: "%.2f")")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.green)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
        .shadow(radius: 5)
        .padding(.horizontal)
    }
    
    private var beneficiaryDistributionSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Beneficiary Distribution")
                .font(.system(size: 20, weight: .bold, design: .rounded))
            
            ForEach(beneficiaries, id: \.name) { beneficiary in
                HStack {
                    Text(beneficiary.name)
                        .font(.system(size: 16, weight: .medium, design: .rounded))
                    Spacer()
                    Text("\(beneficiary.percentage)%")
                        .font(.system(size: 16, weight: .semibold, design: .rounded))
                        .foregroundColor(.blue)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(15)
        .shadow(radius: 5)
        .padding(.horizontal)
    }
}

struct FinanceSubsectionView: View {
    let title: String
    @State private var assets: [Asset] = []
    @State private var isShowingAddAsset = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                ForEach(assets) { asset in
                    AssetRow(asset: asset)
                }
                
                Button(action: {
                    isShowingAddAsset = true
                }) {
                    Label("Add Asset", systemImage: "plus")
                }
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .padding()
        }
        .navigationTitle(title)
        .onAppear {
            assets = getExampleAssets(for: title)
        }
        .sheet(isPresented: $isShowingAddAsset) {
            AddAssetView(assets: $assets)
        }
    }
    
    private func getExampleAssets(for category: String) -> [Asset] {
        switch category {
        case "Real Estate":
            return [
                Asset(name: "Primary Residence", value: 500000),
                Asset(name: "Vacation Home", value: 300000)
            ]
        case "Stock Portfolio":
            return [
                Asset(name: "Apple Inc. (AAPL)", value: 100000),
                Asset(name: "Microsoft Corp. (MSFT)", value: 75000),
                Asset(name: "Amazon.com Inc. (AMZN)", value: 90000)
            ]
        case "Bank Accounts":
            return [
                Asset(name: "Checking Account", value: 25000),
                Asset(name: "Savings Account", value: 100000)
            ]
        case "Retirement Accounts":
            return [
                Asset(name: "401(k)", value: 500000),
                Asset(name: "IRA", value: 250000)
            ]
        case "Personal Property":
            return [
                Asset(name: "Vehicles", value: 50000),
                Asset(name: "Jewelry", value: 25000),
                Asset(name: "Art Collection", value: 100000)
            ]
        case "Other Investments":
            return [
                Asset(name: "Mutual Funds", value: 200000),
                Asset(name: "Bonds", value: 150000)
            ]
        default:
            return []
        }
    }
}

struct AssetRow: View {
    let asset: Asset
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(asset.name)
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                Text("$\(asset.value, specifier: "%.2f")")
                    .font(.system(size: 14, weight: .regular, design: .rounded))
                    .foregroundColor(.secondary)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .foregroundColor(.gray)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(10)
    }
}

struct AddAssetView: View {
    @Binding var assets: [Asset]
    @State private var assetName = ""
    @State private var assetValue = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Asset Name", text: $assetName)
                TextField("Asset Value", text: $assetValue)
                    .keyboardType(.decimalPad)
                
                Button("Add Asset") {
                    if let value = Double(assetValue) {
                        let newAsset = Asset(name: assetName, value: value)
                        assets.append(newAsset)
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .navigationTitle("Add New Asset")
            .navigationBarItems(trailing: Button("Cancel") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
}

struct FinanceSubsection: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
}

struct FinanceSubsectionCard: View {
    let subsection: FinanceSubsection
    
    var body: some View {
        VStack {
            Image(systemName: subsection.icon)
                .font(.system(size: 30))
                .foregroundColor(.white)
                .frame(width: 60, height: 60)
                .background(Color.green)
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

struct Asset: Identifiable {
    let id = UUID()
    let name: String
    let value: Double
}

// Example beneficiary data
let beneficiaries = [
    (name: "Spouse", percentage: 50),
    (name: "Child 1", percentage: 25),
    (name: "Child 2", percentage: 25)
]
