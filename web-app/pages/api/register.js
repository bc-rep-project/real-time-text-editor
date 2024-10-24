
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Here you would typically save the user to your database
    // For this example, we'll just check if the username and password are not empty
    if (username && password) {
      // In a real application, you would hash the password before storing it
      res.status(200).json({ message: 'User registered successfully' });
    } else {
      res.status(400).json({ error: 'Invalid username or password' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
