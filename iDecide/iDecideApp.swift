//
//  iDecideApp.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//

import Foundation
import SwiftUI

@main
struct iDecideApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            LoginView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
