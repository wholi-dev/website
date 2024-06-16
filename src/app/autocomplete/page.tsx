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

      const { verdict } = response.data.result;
      const { validationGranularity } = verdict;

      console.log(submissionCount, validationGranularity)
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

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Address Validation Form</h1>
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
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
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
    </div>
  );
}