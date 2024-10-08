//
//  Item.swift
//  iDecide
//
//  Created by hamish leahy on 13/8/2024.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
