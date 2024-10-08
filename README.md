# iDecide

iDecide is a comprehensive end-of-life planning application developed in SwiftUI. It aims to help users organize and manage various aspects of their legacy, including legal matters, finances, healthcare wishes, and personal memories.

## Features

- User authentication (Sign Up and Login)
- Secure password hashing
- Core Data integration for data persistence
- Modular design with separate views for different planning aspects:
  - Legal Matters
  - Finances & Assets
  - Healthcare Wishes
  - Personal Legacy
  - Digital Affairs
  - Support Network
  - Document Vault
  - Legacy Messages
  - Funeral Planning
  - Resources & Education

## Technologies Used

- Swift 5.x
- SwiftUI
- Core Data
- CryptoKit (for password hashing)

## Setup

1. Clone the repository
2. Open the project in Xcode 12 or later
3. Build and run the project on your preferred simulator or device

## Project Structure

- `iDecideApp.swift`: The main app file that sets up the initial view
- `LoginView.swift`: Handles user login
- `SignUpView.swift`: Manages new user registration
- `HomePage.swift`: The main dashboard after login
- `LegalMattersView.swift`: View for managing legal documents and information
- `FinanceAssetsView.swift`: View for managing financial assets
- `HealthcareWishesView.swift`: View for documenting healthcare preferences
- `PersonalLegacyView.swift`: View for preserving personal memories and values
- `DigitalAffairsView.swift`: View for managing digital assets and accounts
- `SupportNetworkView.swift`: View for organizing support contacts
- `DocumentVaultView.swift`: View for securely storing important documents
- `LegacyMessagesView.swift`: View for creating and managing legacy messages
- `FuneralPlanningView.swift`: View for documenting funeral preferences
- `ResourcesTemplatesView.swift`: View for accessing helpful resources and templates

## Data Model

The app uses Core Data for persistence. The main entity is `User`, which stores user information and authentication details.

## Security

- Passwords are hashed using SHA256 before storage
- The app uses SwiftUI's environment for dependency injection, including the managed object context

## Future Improvements

- Implement more robust password hashing (e.g., bcrypt or Argon2)
- Add email verification for new user sign-ups
- Implement data export and sharing features
- Enhance UI/UX with custom designs and animations
- Add more interactive features to existing views

## Contributing

Please do not make any contributions to iDecide as it is a proprietary platform.

## License

Copyright Notice

All code in this repository is the intellectual property of iDecide Pty Ltd, unless otherwise stated. This includes all source code, documentation, and related assets.

This code is provided under the MIT License, which allows for use, modification, and distribution with proper attribution. However, the following are not covered by this license:

Any proprietary content from the iDecide platform, including but not limited to trademarks, logos, and brand-specific assets.

Any third-party libraries or dependencies included in this repository, which retain their respective licenses.

By contributing to this repository, you agree to assign all rights, including intellectual property rights, to iDecide Pty Ltd. Ensure that any third-party contributions comply with applicable licenses and permissions.

For more details, please refer to the LICENSE file.
## Contact

hamish@idecide.co
