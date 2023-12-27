import asyncio
import unittest
from .utils import parse_data_for_shot_chart, get_all_play_by_play_typeDescKeys, generate_base64_image, generate_html_with_base64_image

class TestUtils(unittest.TestCase):

    def test_parse_data_for_shot_chart_empty(self):
        data = {'play_by_play_data': {'plays': []}}
        result = parse_data_for_shot_chart(data)
        self.assertEqual(result, [])

    def test_parse_data_for_shot_chart_relevant_keys(self):
        data = {
            'play_by_play_data': {
                'plays': [
                    {'typeDescKey': 'missed-shot'},
                    {'typeDescKey': 'shot-on-goal'},
                    {'typeDescKey': 'goal'},
                    {'typeDescKey': 'other-type'}  # This should be ignored
                ]
            }
        }
        result = parse_data_for_shot_chart(data)
        self.assertEqual(len(result), 3)
        self.assertNotIn({'typeDescKey': 'other-type'}, result)

    def test_get_all_play_by_play_typeDescKeys_empty(self):
        data = {'play_by_play_data': {'plays': []}}
        result = get_all_play_by_play_typeDescKeys(data)
        self.assertEqual(result, set())

    def test_get_all_play_by_play_typeDescKeys_non_empty(self):
        data = {
            'play_by_play_data': {
                'plays': [
                    {'typeDescKey': 'missed-shot'},
                    {'typeDescKey': 'shot-on-goal'},
                    {'typeDescKey': 'blocked-shot'},
                    {'typeDescKey': 'goal'},
                    {'typeDescKey': 'goal'}  # Duplicate to test uniqueness
                ]
            }
        }
        result = get_all_play_by_play_typeDescKeys(data)
        self.assertEqual(result, {'missed-shot', 'shot-on-goal', 'blocked-shot', 'goal'})

    def test_generate_base64_image(self):
        # Existing test
        test_data = {'some': 'data'}
        gameId = '1234'
        result = generate_base64_image(test_data, gameId)
        self.assertIsInstance(result, str)
        self.assertTrue(result.startswith('data:image/png;base64,'))

    def test_generate_html_with_base64_image(self):
        # Existing test
        base64_img_str = 'data:image/png;base64,testbase64string'
        result = generate_html_with_base64_image(base64_img_str)
        expected_html = f'<img src="{base64_img_str}" alt="Shot Chart">'
        self.assertEqual(result, expected_html)

if __name__ == '__main__':
    unittest.main()
