// src/components/ErrorBoundary.tsx

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-red-600">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                We apologize for the inconvenience. Please try refreshing the page or return to the home page.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}