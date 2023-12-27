import unittest
from .utils import parse_data_for_shot_chart, generate_base64_image, generate_html_with_base64_image

class TestUtils(unittest.TestCase):

    def test_parse_data_for_shot_chart(self):
        # Assuming parse_data_for_shot_chart simply returns the data for now
        test_data = {'key': 'value'}
        result = parse_data_for_shot_chart(test_data)
        self.assertEqual(result, test_data)

    def test_generate_base64_image(self):
        # Test that the function returns a string and starts with the base64 image prefix
        test_data = {'some': 'data'}
        gameId = '1234'
        result = generate_base64_image(test_data, gameId)
        self.assertIsInstance(result, str)
        self.assertTrue(result.startswith('data:image/png;base64,'))

    def test_generate_html_with_base64_image(self):
        # Test that the function returns correct HTML with the base64 image string
        base64_img_str = 'data:image/png;base64,testbase64string'
        result = generate_html_with_base64_image(base64_img_str)
        expected_html = f'<img src="{base64_img_str}" alt="Shot Chart">'
        self.assertEqual(result, expected_html)

if __name__ == '__main__':
    unittest.main()
