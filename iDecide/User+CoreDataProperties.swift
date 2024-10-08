//
//  User+CoreDataProperties.swift
//  iDecide
//
//  Created by hamish leahy on 22/9/2024.
//
//

import Foundation
import CoreData

extension User {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<User> {
        return NSFetchRequest<User>(entityName: "User")
    }

    @NSManaged public var id: UUID?
    @NSManaged public var first_name: String?
    @NSManaged public var last_name: String?
    @NSManaged public var email: String?
    @NSManaged public var password: String?
}

extension User : Identifiable {
}
