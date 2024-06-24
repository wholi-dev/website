export interface AddressObject {
    street: string;
    aptSuite?: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
  export interface ErrorFields {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
  export interface AddressComponent {
    componentName: {
      text: string;
      languageCode?: string;
    };
    componentType: string;
    confirmationLevel: string;
  }
  
  export interface ValidationResult {
    verdict: {
      validationGranularity: string;
    };
    address: {
      formattedAddress: string;
      addressComponents: AddressComponent[];
    };
    geocode?: {
      location: {
        latitude: number;
        longitude: number;
      };
    };
  }
  
  export interface AddressResult {
    address: AddressObject;
    latitude: number | null;
    longitude: number | null;
    validationGranularity: string;
  }
  
  export interface AddressValidationFormProps {
    initialAddress?: AddressObject;
    onAddressSave: (result: AddressResult) => void;
    onBack?: () => void;
  }
  
  export interface HighlightedAddressProps {
    userAddress: AddressObject;
    validatedAddress: AddressObject;
  }