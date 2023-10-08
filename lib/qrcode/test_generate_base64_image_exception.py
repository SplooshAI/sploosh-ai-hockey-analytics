import unittest
from unittest.mock import Mock, patch
from qrcode_generator import generate_base64_image  # Replace 'your_module' with the name of your module

class TestGenerateBase64Image(unittest.TestCase):

    def test_generic_exception(self):
        # Create a mock object that will raise an exception other than AttributeError when calling `save` method
        image_mock = Mock()
        image_mock.save.side_effect = ValueError("An unexpected error")  # Raise ValueError
        image_mock.savefig.side_effect = ValueError("Another unexpected error")  # Just to make sure it doesn't get called

        result = generate_base64_image(image_mock)

        self.assertIsNone(result, "Expected None when a generic exception occurs")
