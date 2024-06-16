import React, { useState } from 'react';

const BuyerPage = () => {
//   const [email, setEmail] = useState('');
//   const [submitted, setSubmitted] = useState(false);

//   const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setEmail(event.target.value);
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setSubmitted(true);
//     // Add your logic to store the email in Supabase or handle it accordingly.
//   };

//   if (submitted) {
//     return (
//       <div>
//         <h1>Thank you for your interest!</h1>
//         <p>We will notify you when our platform is ready for buyers.</p>
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <label htmlFor="email">Enter your email to stay updated:</label>
//       <input
//         type="email"
//         id="email"
//         value={email}
//         onChange={handleEmailChange}
//         required
//       />
//       <button type="submit">Submit</button>
//     </form>
//   );
// };
  
    return (
      <div>
        <h1>Buyer Page</h1>
        <p>Welcome to the buyer page!</p>
      </div>
    );
  };


export default BuyerPage;
