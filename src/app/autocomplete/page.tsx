'use client';
import axios from 'axios';
import { googleMapsApiKey } from '../../lib/googleMapsClient';
import { useState } from 'react';
import { error } from 'console';

interface AddressObject {
  street: string;
  aptSuite?: string;
  city: string;
  state: string;
  zipCode: string;
}

interface ErrorFields {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressComponent {
  componentName: {
    text: string;
    languageCode?: string;
  };
  componentType: string;
  confirmationLevel: string;
}

interface ValidationResult {
  verdict: {
    validationGranularity: string;
  };
  address: {
    formattedAddress: string;
    addressComponents: AddressComponent[];
  };
}

const extractAddressComponents = (validatedAddress: any): AddressObject => {
  const components = validatedAddress.addressComponents as AddressComponent[];
  let street = '';
  let aptSuite = '';
  let city = '';
  let state = '';
  let zipCode = '';

  components.forEach((component: AddressComponent) => {
    switch (component.componentType) {
      case 'street_number':
        street = component.componentName.text + ' ';
        break;
      case 'route':
        street += component.componentName.text;
        break;
      case 'subpremise':
        aptSuite = component.componentName.text;
        break;
      case 'locality':
        city = component.componentName.text;
        break;
      case 'administrative_area_level_1':
        state = component.componentName.text;
        break;
      case 'postal_code':
        zipCode = component.componentName.text;
        break;
      case 'postal_code_suffix':
        zipCode += '-' + component.componentName.text;
        break;
    }
  });

  return {
    street: street.trim(),
    aptSuite,
    city,
    state,
    zipCode,
  };
};

const compareAddresses = (address1: AddressObject, address2: AddressObject): boolean => {
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim();

  return (
    normalize(address1.street) === normalize(address2.street) &&
    normalize(address1.aptSuite || '') === normalize(address2.aptSuite || '') &&
    normalize(address1.city) === normalize(address2.city) &&
    normalize(address1.state) === normalize(address2.state) &&
    normalize(address1.zipCode) === normalize(address2.zipCode)
  );
};


function useAddressValidation() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAddress = async (address: AddressObject) => {
    setIsValidating(true);
    setError(null);
    try {
      const response = await axios.post(
        `https://addressvalidation.googleapis.com/v1:validateAddress?key=${googleMapsApiKey}`,
        {
          address: {
            regionCode: 'US',
            addressLines: [address.street, address.aptSuite].filter(Boolean),
            locality: address.city,
            administrativeArea: address.state,
            postalCode: address.zipCode,
          },
          enableUspsCass: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setValidationResult(response.data.result);
      return response.data.result;
    } catch (err) {
      setError('Error validating address');
      console.error('Error validating address:', err);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  return { validationResult, isValidating, error, validateAddress };
}

interface HighlightedAddressProps {
  userAddress: AddressObject;
  validatedAddress: AddressObject;
}

const HighlightedAddress: React.FC<HighlightedAddressProps> = ({ userAddress, validatedAddress }) => {
  const highlightDifferences = (str1: string, str2: string) => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    return (
      <span>
        {words2.map((word, index) => {
          const isHighlighted = word.toLowerCase() !== words1[index]?.toLowerCase();
          return (
            <span key={index} className={isHighlighted ? 'highlight-diff' : ''}>
              {word}
              {index < words2.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div>
      <p>
        {highlightDifferences(userAddress.street, validatedAddress.street)}
        {(userAddress.aptSuite || validatedAddress.aptSuite) && (
          <>
            {' '}
            {highlightDifferences(userAddress.aptSuite || '', validatedAddress.aptSuite || '')}
          </>
        )}
        {', '}
        {highlightDifferences(userAddress.city, validatedAddress.city)}
        {', '}
        {highlightDifferences(userAddress.state, validatedAddress.state)}
        {' '}
        {highlightDifferences(userAddress.zipCode, validatedAddress.zipCode)}
        {', USA'}
      </p>
    </div>
  );
};


export default function AddressValidationPage() {
  const [address, setAddress] = useState<AddressObject>({
    street: '',
    aptSuite: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [errorFields, setErrorFields] = useState<ErrorFields>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [showSelectionPage, setShowSelectionPage] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<'user' | 'api'>('api');
  const [previousSubmittedAddress, setPreviousSubmittedAddress] = useState<AddressObject | null>(null);

  const { validationResult, isValidating, error, validateAddress } = useAddressValidation();
  
  const handleFormValidation = (validationResult: any) => {
    const { verdict, address } = validationResult;
    const { validationGranularity } = verdict;
    const { addressComponents, missingComponentTypes = [] } = address;

    const updatedErrorFields = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    };

    addressComponents.forEach((component: any) => {
      if (component.confirmationLevel === 'UNCONFIRMED_AND_SUSPICIOUS') {
        if (component.componentType === 'street_number' || component.componentType === 'route') {
          updatedErrorFields.street = 'Please double-check the street address.';
        } else if (component.componentType === 'locality') {
          updatedErrorFields.city = 'Please double-check the city.';
        } else if (component.componentType === 'administrative_area_level_1') {
          updatedErrorFields.state = 'Please double-check the state.';
        } else if (component.componentType === 'postal_code') {
          updatedErrorFields.zipCode = 'Please double-check the zip code.';
        }
      }
    });


    if (validationGranularity === 'OTHER') {
      missingComponentTypes.forEach((componentType: string) => {
        if (componentType === 'street_number' || componentType === 'route') {
          updatedErrorFields.street = 'Please double-check the street address.';
        } else if (componentType === 'locality') {
          updatedErrorFields.city = 'Please double-check the city.';
        } else if (componentType === 'administrative_area_level_1') {
          updatedErrorFields.state = 'Please double-check the state.';
        } else if (componentType === 'postal_code') {
          updatedErrorFields.zipCode = 'Please double-check the zip code.';
        }
      });
    } else if (validationGranularity === 'ROUTE') {
      updatedErrorFields.street = 'Please double-check the street address.';
    }

    setErrorFields(updatedErrorFields);
    
    const hasErrors = Object.values(updatedErrorFields).some((error) => error !== '');
    // make sure there is an error if the granularity is OTHER
    if (!hasErrors && validationGranularity === 'OTHER') {
      updatedErrorFields.street = 'Please double-check the address.';
      updatedErrorFields.city = 'Please double-check the address.';
      updatedErrorFields.state = 'Please double-check the address.';
      updatedErrorFields.zipCode = 'Please double-check the address.';
      setErrorFields(updatedErrorFields);
      return true;
    }

    // return true if there are any error fields
    return hasErrors;
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleFormSubmit = async () => {
    // First, check if all required fields are filled
    const updatedErrorFields = {
      street: address.street.trim() === '' ? 'Please enter a street address.' : '',
      city: address.city.trim() === '' ? 'Please enter a city.' : '',
      state: address.state.trim() === '' ? 'Please enter a state.' : '',
      zipCode: address.zipCode.trim() === '' ? 'Please enter a zip code.' : '',
    };
  
    setErrorFields(updatedErrorFields);
  
    if (Object.values(updatedErrorFields).some((error) => error !== '')) {
      return;
    }
  
    // Validate the address
    const result = await validateAddress(address);
  
    if (!result) {
      console.error('Validation failed');
      return;
    }
  
    const hasErrors = handleFormValidation(result);
    const {
      verdict: { validationGranularity },
      address: validatedAddress
    } = result;

    const addressRepeated = JSON.stringify(address) === JSON.stringify(previousSubmittedAddress);
    // this line has to be called after. Might have to change for javascript weirdness
    setPreviousSubmittedAddress(address);
    const extractedValidatedAddress = extractAddressComponents(validatedAddress);
    const hasAPIDifferences = !compareAddresses(address, extractedValidatedAddress);


    if (addressRepeated) {
      if (validationGranularity === 'OTHER') {
        showNotInSystemWarning();
        return;
      }

      if (hasAPIDifferences) {
        setShowSelectionPage(true);
        return;
      }
    
      handleSaveAddress();
      return;
    }
    // at this point, we have handled all cases where the address is repeated

    if (hasErrors) {
      return;
    }

    if (hasAPIDifferences) {
      setShowSelectionPage(true);
      return;
    }

    // the only case left is that the address is good, and there are no errors
    handleSaveAddress();
    return;

    // make sure that hasError is true when the granularity is other
    //TODO also edit the highlight function
  };

  const showNotInSystemWarning = () => {
    console.log('Warning! Address not found in the system');
    // Here you might want to show a warning message to the user
    // You could also provide an option to save the address as entered
  }

  const handleEditValidatedAddress = () => {
    if (validationResult) {
      const validatedAddress = validationResult.address;
      const extractedAddress = extractAddressComponents(validatedAddress);
      
      setAddress(extractedAddress);
      setSelectedAddress('api');
      setShowSelectionPage(false);
    } else {
      console.error('No validation result available');
      // You might want to handle this case, perhaps by showing an error message to the user
    }
  };

  const handleSaveAddress = () => {
    if (selectedAddress === 'user') {
      console.log('Saving user input address:', address);
    } else if (validationResult) {
      console.log('Saving validated address:', validationResult.address.formattedAddress);
    } else {
      console.error('No validation result available');
      // You might want to handle this case, perhaps by showing an error message to the user
    }
    // Here you would typically send the selected address to your backend or perform any other necessary actions
    // After saving, you might want to navigate to another page or show a success message
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
    <h1 className="text-2xl font-bold mb-6">Address Validation Form</h1>
    {showSelectionPage ? (
        <div>
        <h2 className="text-xl font-bold mb-4">Select Address</h2>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="userAddress"
              name="addressChoice"
              value="user"
              checked={selectedAddress === 'user'}
              onChange={() => setSelectedAddress('user')}
              className="mr-2"
            />
            <label htmlFor="userAddress" className="font-medium">Your Input:</label>
          </div>
          <p>{address.street}{address.aptSuite ? ' ' + address.aptSuite : ''}, {address.city}, {address.state} {address.zipCode}, USA</p>
          {selectedAddress === 'user' && (
            <button
              type="button"
              onClick={() => setShowSelectionPage(false)}
              className="mt-2 text-blue-500 underline hover:text-blue-700 focus:outline-none"
            >
              Edit this address
            </button>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="validatedAddress"
              name="addressChoice"
              value="api"
              checked={selectedAddress === 'api'}
              onChange={() => setSelectedAddress('api')}
              className="mr-2"
            />
            <label htmlFor="validatedAddress" className="font-medium">Recommended Address:</label>
          </div>
          {validationResult? <HighlightedAddress 
            userAddress={address}
            validatedAddress={extractAddressComponents(validationResult.address)}
          />: <p>We're Wholi sorry. There's been some error validating the address.</p>}
          {selectedAddress === 'api' && (
            <button
              type="button"
              onClick={() => handleEditValidatedAddress()}
              className="mt-2 text-blue-500 underline hover:text-blue-700 focus:outline-none"
            >
              Edit this address
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSaveAddress}
          className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:bg-green-600"
        >
          Save Address
        </button>
      </div>
    ) : (
    <>
    <form>
      <div className="mb-4">
        <label htmlFor="street" className="block mb-2 font-medium">
          Street Address
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={address.street}
          onChange={handleAddressChange}
          className={errorFields.street ? 'inp inp-error' : 'inp'}
          required
        />
        {errorFields.street && <p className="err-msg">{errorFields.street}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="aptSuite" className="block mb-2 font-medium">
          Apt/Suite/Unit/Building (optional)
        </label>
        <input
          type="text"
          id="aptSuite"
          name="aptSuite"
          value={address.aptSuite}
          onChange={handleAddressChange}
          className="inp"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="city" className="block mb-2 font-medium">
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={address.city}
          onChange={handleAddressChange}
          className={errorFields.city ? 'inp inp-error' : 'inp'}
          required
        />
        {errorFields.city && <p className="err-msg">{errorFields.city}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="state" className="block mb-2 font-medium">
          State
        </label>
        <input
          type="text"
          id="state"
          name="state"
          value={address.state}
          onChange={handleAddressChange}
          className={errorFields.state ? 'inp inp-error' : 'inp'}
          required
        />
        {errorFields.state && <p className="err-msg">{errorFields.state}</p>}
      </div>
      <div className="mb-6">
        <label htmlFor="zipCode" className="block mb-2 font-medium">
          ZIP Code
        </label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          value={address.zipCode}
          onChange={handleAddressChange}
          className={errorFields.zipCode ? 'inp inp-error' : 'inp'}
          required
        />
        {errorFields.zipCode && <p className="err-msg">{errorFields.zipCode}</p>}
      </div>
      <button
        type="button"
        onClick={handleFormSubmit}
        className="btn btn-primary w-full"
      >
        Add Address
      </button>
    </form>
    {validationResult && (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Validation Result:</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify(validationResult, null, 2)}
        </pre>
      </div>
    )}
    </>
    )}
  </div>)};