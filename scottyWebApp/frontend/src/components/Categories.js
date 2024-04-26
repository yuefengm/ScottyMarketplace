export const categoryOptions = [
    { value: 'cat1', label: 'Clothing & Apparel' },
    { value: 'cat2', label: 'Electronics' },
    { value: 'cat3', label: 'Home & Garden' },
    { value: 'cat4', label: 'Health & Beauty' },
    { value: 'cat5', label: 'Sports & Outdoors' },
  ];
  
  // Define a function to find label by value
  export const findLabel = (value) => {
    const option = categoryOptions.find(option => option.value === value);
    return option ? option.label : 'Label not found';
  };
  
  // Define a function to find value by label
  export const findValue = (label) => {
    const option = categoryOptions.find(option => option.label === label);
    return option ? option.value : 'Value not found';
  };