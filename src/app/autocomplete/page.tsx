'use client';
import axios from 'axios';
import { googleMapsApiKey } from '../../lib/googleMapsClient';
import { useState } from 'react';
import { error } from 'console';

export default function AddressValidationPage() {
  const [address, setAddress] = useState({
    street: '',
    aptSuite: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [errorFields, setErrorFields] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [validationResult, setValidationResult] = useState<any>(null);
  const [submissionCount, setSubmissionCount] = useState(1);
  const [showSelectionPage, setShowSelectionPage] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<'user' | 'api'>('api');

  interface ExtractedAddress {
    street: string;
    aptSuite: string;
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
  
  const extractAddressComponents = (validatedAddress: any): ExtractedAddress => {
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

  const handleAddressValidation = async () => {
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
      handleFormValidation(response.data.result);
  
      const { verdict, address: validatedAddress } = response.data.result;
      const { validationGranularity } = verdict;

      const extractedAddress = extractAddressComponents(validatedAddress);
    
      const userFormattedAddress = `${address.street}${address.aptSuite ? ' ' + address.aptSuite : ''}, ${address.city}, ${address.state} ${address.zipCode}, USA`;
      const validatedFormattedAddress = `${extractedAddress.street}${extractedAddress.aptSuite ? ' ' + extractedAddress.aptSuite : ''}, ${extractedAddress.city}, ${extractedAddress.state} ${extractedAddress.zipCode}, USA`;
    
      console.log('User Formatted Address:', userFormattedAddress);
      console.log('Validated Formatted Address:', validatedFormattedAddress);
    
      const hasDifferences = userFormattedAddress.toLowerCase() !== validatedFormattedAddress.toLowerCase();
    
      setShowSelectionPage(hasDifferences);
  
      if (submissionCount >= 1 && validationGranularity !== 'OTHER') {
        console.log('Congratulations! The address is valid.');
      } else if (submissionCount >= 2 && validationGranularity === 'OTHER') {
        console.log('Address is not in our postal records. Go back or continue anyway?');
      }
    } catch (error) {
      console.error('Error validating address:', error);
    }
  };

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
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleFormSubmit = () => {
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

    setSubmissionCount((prevCount) => prevCount + 1);
    handleAddressValidation();
  };

  const handleEditValidatedAddress = () => {
    const validatedAddress = validationResult.address;
    const extractedAddress = extractAddressComponents(validatedAddress);
    
    setAddress(extractedAddress);
    setSelectedAddress('api');
    setShowSelectionPage(false);
  };

  const handleSaveAddress = () => {
    if (selectedAddress === 'user') {
      console.log('Saving user input address:', address);
    } else {
      console.log('Saving validated address:', validationResult.address.formattedAddress);
    }
    // Here you would typically send the selected address to your backend or perform any other necessary actions
    // After saving, you might want to navigate to another page or show a success message
  };

  
  interface HighlightedAddressProps {
    userAddress: string;
    validatedAddress: string;
  }
  
  const HighlightedAddress: React.FC<HighlightedAddressProps> = ({ userAddress, validatedAddress }) => {
    const userWords = userAddress.split(' ');
    const validatedWords = validatedAddress.split(' ');
  
    return (
      <p>
        {validatedWords.map((word, index) => {
          const isHighlighted = word.toLowerCase() !== userWords[index]?.toLowerCase();
          return (
            <span key={index} className={isHighlighted ? 'highlight-diff' : ''}>
              {word}{' '}
            </span>
          );
        })}
      </p>
    );
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
          <HighlightedAddress 
            userAddress={`${address.street}${address.aptSuite ? ' ' + address.aptSuite : ''}, ${address.city}, ${address.state} ${address.zipCode}, USA`}
            validatedAddress={validationResult.address.formattedAddress}
          />
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
        Validate Address
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
  
  
  
 