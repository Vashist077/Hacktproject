from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import spacy

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize NLP components
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# Try to load spaCy model, fallback to basic processing if not available
try:
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except OSError:
    logger.warning("spaCy model not found. Using basic text processing.")
    SPACY_AVAILABLE = False

# Known subscription services and their patterns
SUBSCRIPTION_PATTERNS = {
    'netflix': ['netflix', 'nflx'],
    'spotify': ['spotify', 'spotify premium'],
    'amazon_prime': ['amazon prime', 'prime video', 'amazon prime video'],
    'disney_plus': ['disney+', 'disney plus', 'hotstar', 'disney hotstar'],
    'adobe': ['adobe', 'creative cloud', 'adobe creative cloud'],
    'microsoft': ['microsoft', 'office 365', 'microsoft 365'],
    'google': ['google', 'google drive', 'google one', 'youtube premium'],
    'apple': ['apple', 'apple music', 'icloud', 'apple tv'],
    'dropbox': ['dropbox'],
    'zoom': ['zoom'],
    'slack': ['slack'],
    'notion': ['notion'],
    'canva': ['canva'],
    'grammarly': ['grammarly'],
    'lastpass': ['lastpass'],
    'nordvpn': ['nordvpn', 'nord vpn'],
    'expressvpn': ['expressvpn', 'express vpn'],
    'surfshark': ['surfshark'],
    'linkedin': ['linkedin premium'],
    'medium': ['medium'],
    'new_york_times': ['new york times', 'nytimes'],
    'wall_street_journal': ['wall street journal', 'wsj'],
    'the_guardian': ['the guardian'],
    'bloomberg': ['bloomberg'],
    'economist': ['the economist']
}

# Fraud indicators
FRAUD_INDICATORS = [
    'unauthorized', 'fraudulent', 'suspicious', 'unknown', 'unrecognized',
    'did not authorize', 'not authorized', 'fraud', 'scam', 'phishing',
    'identity theft', 'card stolen', 'account compromised'
]

# Amount patterns for different currencies
AMOUNT_PATTERNS = {
    'INR': r'₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*rupees?',
    'USD': r'\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*dollars?',
    'EUR': r'€\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*euros?',
    'GBP': r'£\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*pounds?'
}

class TransactionProcessor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
    def extract_transaction_data(self, text: str) -> Dict:
        """Extract transaction data from text"""
        try:
            # Clean and normalize text
            cleaned_text = self._clean_text(text)
            
            # Extract amount
            amount, currency = self._extract_amount(cleaned_text)
            
            # Extract merchant/service name
            merchant = self._extract_merchant(cleaned_text)
            
            # Extract date
            date = self._extract_date(cleaned_text)
            
            # Determine transaction type
            transaction_type = self._classify_transaction_type(cleaned_text)
            
            # Calculate confidence score
            confidence = self._calculate_confidence(cleaned_text, amount, merchant)
            
            return {
                'amount': amount,
                'currency': currency,
                'merchant': merchant,
                'date': date,
                'type': transaction_type,
                'confidence': confidence,
                'raw_text': text
            }
            
        except Exception as e:
            logger.error(f"Error extracting transaction data: {e}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\,\:\-\$₹€£]', '', text)
        
        return text.strip()
    
    def _extract_amount(self, text: str) -> Tuple[float, str]:
        """Extract amount and currency from text"""
        for currency, pattern in AMOUNT_PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Get the first match
                amount_str = matches[0][0] if matches[0][0] else matches[0][1]
                if amount_str:
                    # Clean amount string
                    amount_str = re.sub(r'[,\s]', '', amount_str)
                    try:
                        amount = float(amount_str)
                        return amount, currency
                    except ValueError:
                        continue
        
        return 0.0, 'INR'  # Default currency
    
    def _extract_merchant(self, text: str) -> str:
        """Extract merchant/service name from text"""
        # Check for known subscription services
        for service, patterns in SUBSCRIPTION_PATTERNS.items():
            for pattern in patterns:
                if pattern in text:
                    return service.replace('_', ' ').title()
        
        # Try to extract merchant from common patterns
        merchant_patterns = [
            r'to\s+([a-zA-Z\s]+?)(?:\s|$|\.|,)',
            r'from\s+([a-zA-Z\s]+?)(?:\s|$|\.|,)',
            r'at\s+([a-zA-Z\s]+?)(?:\s|$|\.|,)',
            r'payment\s+to\s+([a-zA-Z\s]+?)(?:\s|$|\.|,)',
            r'charged\s+by\s+([a-zA-Z\s]+?)(?:\s|$|\.|,)'
        ]
        
        for pattern in merchant_patterns:
            matches = re.findall(pattern, text)
            if matches:
                merchant = matches[0].strip()
                if len(merchant) > 2 and len(merchant) < 50:
                    return merchant.title()
        
        return "Unknown Merchant"
    
    def _extract_date(self, text: str) -> Optional[str]:
        """Extract date from text"""
        # Common date patterns
        date_patterns = [
            r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
            r'(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})',
            r'(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    date_str = matches[0]
                    # Try to parse the date
                    for fmt in ['%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%d', '%d-%m-%Y']:
                        try:
                            parsed_date = datetime.strptime(date_str, fmt)
                            return parsed_date.isoformat()
                        except ValueError:
                            continue
                except:
                    continue
        
        return None
    
    def _classify_transaction_type(self, text: str) -> str:
        """Classify the type of transaction"""
        # Check for subscription indicators
        subscription_indicators = [
            'subscription', 'renewal', 'monthly', 'annual', 'yearly',
            'recurring', 'auto-renew', 'billing', 'membership'
        ]
        
        if any(indicator in text for indicator in subscription_indicators):
            return 'subscription'
        
        # Check for fraud indicators
        if any(indicator in text for indicator in FRAUD_INDICATORS):
            return 'fraud'
        
        # Check for one-time payment
        one_time_indicators = [
            'one-time', 'single payment', 'purchase', 'buy', 'order'
        ]
        
        if any(indicator in text for indicator in one_time_indicators):
            return 'one_time'
        
        return 'unknown'
    
    def _calculate_confidence(self, text: str, amount: float, merchant: str) -> float:
        """Calculate confidence score for the extracted data"""
        confidence = 0.0
        
        # Amount confidence
        if amount > 0:
            confidence += 0.4
        
        # Merchant confidence
        if merchant != "Unknown Merchant":
            confidence += 0.3
        
        # Text length confidence
        if len(text) > 50:
            confidence += 0.1
        
        # Pattern matching confidence
        if any(pattern in text for pattern in ['payment', 'charged', 'debited', 'transaction']):
            confidence += 0.2
        
        return min(confidence, 1.0)

class FraudDetector:
    def __init__(self):
        self.suspicious_patterns = [
            r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}',  # Email patterns
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',  # URL patterns
            r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card patterns
        ]
    
    def detect_fraud(self, transaction_data: Dict, user_history: List[Dict] = None) -> Dict:
        """Detect potential fraud in transaction"""
        fraud_score = 0.0
        fraud_reasons = []
        
        # Check for suspicious patterns in merchant name
        if self._is_suspicious_merchant(transaction_data.get('merchant', '')):
            fraud_score += 0.3
            fraud_reasons.append("Suspicious merchant name")
        
        # Check for unusual amount
        if user_history:
            if self._is_unusual_amount(transaction_data.get('amount', 0), user_history):
                fraud_score += 0.2
                fraud_reasons.append("Unusual transaction amount")
        
        # Check for unknown merchant
        if transaction_data.get('merchant') == "Unknown Merchant":
            fraud_score += 0.2
            fraud_reasons.append("Unknown merchant")
        
        # Check for high amount
        if transaction_data.get('amount', 0) > 10000:  # More than ₹10,000
            fraud_score += 0.1
            fraud_reasons.append("High transaction amount")
        
        # Check for suspicious text patterns
        text = transaction_data.get('raw_text', '')
        if self._has_suspicious_patterns(text):
            fraud_score += 0.2
            fraud_reasons.append("Suspicious text patterns")
        
        return {
            'is_fraud': fraud_score > 0.5,
            'fraud_score': fraud_score,
            'reasons': fraud_reasons,
            'confidence': min(fraud_score, 1.0)
        }
    
    def _is_suspicious_merchant(self, merchant: str) -> bool:
        """Check if merchant name is suspicious"""
        suspicious_keywords = [
            'unknown', 'unrecognized', 'suspicious', 'fraud', 'scam',
            'phishing', 'fake', 'illegal', 'unauthorized'
        ]
        
        merchant_lower = merchant.lower()
        return any(keyword in merchant_lower for keyword in suspicious_keywords)
    
    def _is_unusual_amount(self, amount: float, user_history: List[Dict]) -> bool:
        """Check if amount is unusual compared to user history"""
        if not user_history or len(user_history) < 5:
            return False
        
        # Calculate average and standard deviation of past transactions
        amounts = [t.get('amount', 0) for t in user_history if t.get('amount', 0) > 0]
        if len(amounts) < 3:
            return False
        
        mean_amount = np.mean(amounts)
        std_amount = np.std(amounts)
        
        # Check if current amount is more than 2 standard deviations from mean
        return abs(amount - mean_amount) > 2 * std_amount
    
    def _has_suspicious_patterns(self, text: str) -> bool:
        """Check for suspicious patterns in text"""
        for pattern in self.suspicious_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False

class SubscriptionAnalyzer:
    def __init__(self):
        self.processor = TransactionProcessor()
        self.fraud_detector = FraudDetector()
    
    def analyze_transactions(self, transactions: List[Dict], user_id: str = None) -> Dict:
        """Analyze list of transactions and return structured results"""
        try:
            subscriptions = []
            fraud_alerts = []
            
            for transaction in transactions:
                # Process transaction
                processed_data = self.processor.extract_transaction_data(
                    transaction.get('text', '')
                )
                
                if not processed_data:
                    continue
                
                # Detect fraud
                fraud_result = self.fraud_detector.detect_fraud(
                    processed_data, 
                    transaction.get('user_history', [])
                )
                
                # Add to appropriate category
                if fraud_result['is_fraud']:
                    fraud_alerts.append({
                        'merchant': processed_data['merchant'],
                        'amount': processed_data['amount'],
                        'currency': processed_data['currency'],
                        'date': processed_data['date'],
                        'reason': ', '.join(fraud_result['reasons']),
                        'confidence': fraud_result['confidence'],
                        'raw_text': processed_data['raw_text']
                    })
                elif processed_data['type'] == 'subscription':
                    subscriptions.append({
                        'name': processed_data['merchant'],
                        'amount': processed_data['amount'],
                        'currency': processed_data['currency'],
                        'renewal': processed_data['date'],
                        'confidence': processed_data['confidence'],
                        'raw_text': processed_data['raw_text']
                    })
            
            return {
                'subscriptions': subscriptions,
                'fraud_alerts': fraud_alerts,
                'total_processed': len(transactions),
                'subscriptions_found': len(subscriptions),
                'fraud_alerts_found': len(fraud_alerts)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing transactions: {e}")
            return {
                'subscriptions': [],
                'fraud_alerts': [],
                'error': str(e)
            }

# Initialize analyzer
analyzer = SubscriptionAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/analyze', methods=['POST'])
def analyze_transactions():
    """Analyze transactions and detect subscriptions/fraud"""
    try:
        data = request.get_json()
        
        if not data or 'transactions' not in data:
            return jsonify({
                'error': 'No transactions provided'
            }), 400
        
        transactions = data['transactions']
        user_id = data.get('user_id')
        
        if not isinstance(transactions, list):
            return jsonify({
                'error': 'Transactions must be a list'
            }), 400
        
        # Analyze transactions
        result = analyzer.analyze_transactions(transactions, user_id)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/extract', methods=['POST'])
def extract_transaction():
    """Extract transaction data from single text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        
        # Extract transaction data
        result = analyzer.processor.extract_transaction_data(text)
        
        if not result:
            return jsonify({
                'error': 'Could not extract transaction data'
            }), 400
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error in extract endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/detect-fraud', methods=['POST'])
def detect_fraud():
    """Detect fraud in transaction"""
    try:
        data = request.get_json()
        
        if not data or 'transaction' not in data:
            return jsonify({
                'error': 'No transaction data provided'
            }), 400
        
        transaction = data['transaction']
        user_history = data.get('user_history', [])
        
        # Detect fraud
        result = analyzer.fraud_detector.detect_fraud(transaction, user_history)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error in detect-fraud endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/classify-subscription', methods=['POST'])
def classify_subscription():
    """Classify if transaction is a subscription"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        
        # Extract transaction data
        transaction_data = analyzer.processor.extract_transaction_data(text)
        
        if not transaction_data:
            return jsonify({
                'error': 'Could not extract transaction data'
            }), 400
        
        # Classify transaction type
        is_subscription = transaction_data['type'] == 'subscription'
        
        return jsonify({
            'success': True,
            'data': {
                'is_subscription': is_subscription,
                'transaction_type': transaction_data['type'],
                'confidence': transaction_data['confidence'],
                'merchant': transaction_data['merchant'],
                'amount': transaction_data['amount']
            }
        })
        
    except Exception as e:
        logger.error(f"Error in classify-subscription endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
